import { Annotation, BaseChannel, END, START, StateGraph } from "@langchain/langgraph";
import { AnnotationRoot } from "@langchain/langgraph/dist/graph";
import { Injectable, Logger } from "@nestjs/common";
import { OperationHistoryType, XPost, XPostType } from "@prisma/client";
import { uniq } from "lodash";
import * as moment from "moment";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { TwitterService } from "src/twitter/twitter.service";
import { XPostsService } from "src/xposts/xposts.service";
import { classifyReplyAgent } from "./agents/classify-reply.agent";
import { replyAgent } from "./agents/reply.agent";
import { ReplierNode } from "./model/replier-node";
import { TweetTrait } from "./model/tweet-trait";
import { shouldReplyRouter } from "./routers/should-reply.router";

const FetchRepliesDelayMs = 60 * 1000; // 1 minute
const ProduceRepliesCheckDelayMs = 60 * 1000; // 1 minute - interval between loops that check if a reply has to be produced

type ReplierStateAnnotationSchema = {
  tweetTraits: BaseChannel<TweetTrait[]>,
  tweetReply: BaseChannel<string>
}

export let replierStateAnnotation: AnnotationRoot<ReplierStateAnnotationSchema>;

/**
 * This service monitors third party user replies to posts we published, decides to reply and with which content.
 */
@Injectable()
export class XReplierService {
  private logger = new Logger("XReplier");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private twitterAuth: TwitterAuthService,
    private langchain: LangchainService,
    private xPosts: XPostsService
  ) { }

  /**
   * TODO:
   * - fetch replies via API
   * - store replies into DB (so for ex we reply later, not instantly)
   * - classify:
   *  - has question? has disagreement?
   *  - is request for financial advice?
   *  - etc
   * - based on all the classification factors, decide:
   *  - to reply or not
   *  - which agent replies
   *  - post reply
   */

  public run() {
    // Task 1 - Launch the reply fetcher 
    this.fetchRecentReplies();

    // Task 2 - Launch the replier
    this.runReplier();
  }

  /**
   * Permanent loop that fetches recent replies to posts published by our bot.
   * Posts are stored into database for later use.
   */
  private async fetchRecentReplies() {
    // Check when we last fetched
    let latestFetchDate = await this.lastRepliesFetchDate();
    if (!latestFetchDate) {
      // No entry yet? Fetch only since a few hours ago to save data
      latestFetchDate = moment().subtract(12, "hours").toDate();
    }

    // Fetch recent replies, not earlier than last time we checked
    this.logger.log(`Fetching recent X replies not earlier than ${latestFetchDate}`);
    const replies = await this.twitter.fetchRepliesToSelf(moment(latestFetchDate));
    this.logger.log(`Got ${replies.length} replies from twitter api`);

    // Store every reply that we don't have yet
    const newReplies: XPost[] = [];
    for (var reply of replies) {
      console.log("reply", reply)

      const existingReply = await this.getDBReplyByTwitterPostId(reply.id);
      if (!existingReply) {
        // Find parent tweet
        const parentXPostId = reply.referenced_tweets?.find(t => t.type === "replied_to")?.id;

        // Save reply to database
        const dbReply = await this.prisma.xPost.create({
          data: {
            type: XPostType.UserReply,
            text: reply.text,
            authorId: reply.author_id,
            postId: reply.id,
            publishedAt: reply.created_at,
            parentPostId: parentXPostId,
            rootPostId: reply.conversation_id
          }
        });
        newReplies.push(dbReply);
      }
    }

    // Remember last fetch time
    await this.prisma.operationHistory.create({ data: { type: OperationHistoryType.FetchRepliesToSelf } });

    setTimeout(() => {
      this.fetchRecentReplies();
    }, FetchRepliesDelayMs);
  }

  private async lastRepliesFetchDate(): Promise<Date> {
    const mostRecentFetch = await this.prisma.operationHistory.findFirst({
      where: { type: OperationHistoryType.FetchRepliesToSelf },
      orderBy: { createdAt: "desc" }
    });

    return mostRecentFetch?.createdAt; // possibly undefined if just starting
  }

  private getDBReplyByTwitterPostId(twitterPostId: string): Promise<XPost> {
    return this.prisma.xPost.findFirst({ where: { postId: twitterPostId } });
  }

  /**
   * One replier loop that checks if some new replies have been sent to us and cached,
   * and try to answer them.
   */
  private async runReplier() {
    // Find the first post eligible for a reply analysis. This means replies we have received from users
    // (root post should be our post) and that have not been handled yet.
    const xReply = await this.prisma.xPost.findFirst({
      where: {
        type: XPostType.UserReply, // Only reply to what third party users wrote
        parentPostId: { not: null }, // is a reply
        wasReplyHandled: false
      }
    });

    console.log("xReply", xReply)

    if (xReply) {
      const tools = [
        //TODO
        // categorizeNewsTool(this.logger, this.prisma, post) // ability to update a DB post with "isRealNews" info
      ];
      const _classifyReplyAgent = classifyReplyAgent(tools, xReply);
      const _shouldReplyRouter = shouldReplyRouter(tools, xReply);
      const _replyAgent = replyAgent(tools, xReply);

      replierStateAnnotation = Annotation.Root<ReplierStateAnnotationSchema>({
        // TODO: something wrong with the reducer, should not need to use uniq() but apparently traits are duplicated many times (after each agent call?)
        tweetTraits: Annotation<TweetTrait[]>({ reducer: (a, b) => uniq([...a, ...b]), default: () => [] }),
        tweetReply: Annotation<string>({ reducer: (a, b) => b, default: () => null, }),
      });

      const graph = new StateGraph(replierStateAnnotation)
        .addNode(ReplierNode.Classify, _classifyReplyAgent)
        .addNode(ReplierNode.DecideToReply, _shouldReplyRouter)
        .addNode(ReplierNode.Reply, _replyAgent)

      graph
        .addEdge(START, ReplierNode.Classify) // when starting, classify / get traits
        .addConditionalEdges(ReplierNode.Classify, _shouldReplyRouter) // after classification, decide to reply or not
        .addEdge(ReplierNode.Reply, END) // After replying, end

      const app = graph.compile();

      // // Invoke tools targeted by the graph
      const result: typeof replierStateAnnotation.State = await app.invoke({});
      // await this.langchain.executeAllToolCalls(tools, result);
      console.log("result", result)

      if (result.tweetReply) {
        const botAccount = await this.twitterAuth.getAuthenticatedBotAccount();

        // Mark as handled, so we don't try to reply again
        await this.xPosts.markAsReplied(xReply);

        // Schedule a post
        this.logger.log("Scheduling new X reply post");
        await this.prisma.xPost.create({
          data: {
            type: XPostType.BotReply,
            text: result.tweetReply,
            authorId: botAccount.userId,
            parentPostId: xReply.postId,
            rootPostId: xReply.rootPostId
          }
        });
      }
    }

    await this.xPosts.sendPendingXPosts(XPostType.BotReply);

    // Rearm
    setTimeout(() => {
      this.runReplier();
    }, ProduceRepliesCheckDelayMs);
  }
}