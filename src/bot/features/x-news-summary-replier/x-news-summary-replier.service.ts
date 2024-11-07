import { Annotation, BaseChannel, END, START, StateGraph } from "@langchain/langgraph";
import { AnnotationRoot } from "@langchain/langgraph/dist/graph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { uniq } from "lodash";
import { BotFeature } from "src/bot/model/bot-feature";
import { StudiedPost } from "src/bot/model/studied-post";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { TwitterService } from "src/twitter/twitter.service";
import { XPostsService } from "src/xposts/xposts.service";
import { replyAgent } from "./agents/reply.agent";
import { classifyPostAgent } from "./classify-post.agent";
import { ReplierNode } from "./model/replier-node";
import { TweetTrait } from "./model/tweet-trait";
import { postReplyRouter } from "./post-reply.router";

const ProduceRepliesCheckDelaySec = 60; // 1 minute - interval between loops that check if a reply has to be produced

type ReplierStateAnnotationSchema = {
  tweetTraits: BaseChannel<TweetTrait[]>,
  tweetReply: BaseChannel<string>
}

export let replierStateAnnotation: AnnotationRoot<ReplierStateAnnotationSchema>;

/**
 * This feature generates replies to X users that posted in reply to our news summary posts.
 */
@Injectable()
export class NewsSummaryReplierService extends BotFeature {
  private logger = new Logger("NewsSummaryReplier");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private twitterAuth: TwitterAuthService,
    private langchain: LangchainService,
    private xPosts: XPostsService
  ) {
    super(ProduceRepliesCheckDelaySec);
  }

  /**
   * Checks if some new replies have been sent to us as a reply to our news summaries,
   * and try to answer them.
   */
  async studyReplyToXPost?(xPost: XPost): Promise<StudiedPost> {

    if (xPost) {
      this.logger.log("Building X reply for post:");
      this.logger.log(xPost);

      const tools = [
        // nothing yet
      ];
      const _classifyReplyAgent = classifyPostAgent(tools, xPost);
      const _shouldReplyRouter = postReplyRouter(tools, xPost);
      const _replyAgent = replyAgent(tools, xPost);

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

      this.logger.log("Reply generation result:");
      this.logger.log(result);

      if (result.tweetReply) {
        const botAccount = await this.twitterAuth.getAuthenticatedBotAccount();

        // Schedule a post
        this.logger.log("Scheduling new X reply post");
        await this.prisma.xPost.create({
          data: {
            publishRequestAt: new Date(),
            text: result.tweetReply,
            authorId: botAccount.userId,
            parentPostId: xPost.postId,
            rootPostId: xPost.rootPostId
          }
        });
      }

      // No matter if we could generate a reply or not, mark as user's reply as 
      // handled, so we don't try to handle it again later. A missed reply is better than being stuck forever.
      await this.xPosts.markAsReplied(xPost);
    }

    return {
      sourcePost: xPost
    }
  }
}