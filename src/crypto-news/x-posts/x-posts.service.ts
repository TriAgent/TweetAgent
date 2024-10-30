import { BaseMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { OperationHistoryType, XPost, XPostType } from "@prisma/client";
import * as moment from "moment";
import { BotConfig } from "src/config/bot-config";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterService } from "src/twitter/twitter.service";
import { categorizeNewsAgent } from "./agents/categorize-news.agent";
import { categorizeNewsTool } from "./tools/categorize-news.tool";

const FetchXPostsDelay = 5 * 60 * 1000; // 5 minutes

/**
 * This service regularly fetches tweets about crypto news from X, categorizes them
 * as real news or not, and stores them into database.
 */
@Injectable()
export class XPostsNewsService {
  private logger = new Logger("XPostsNews");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private langchain: LangchainService
  ) { }

  public run() {
    this.fetchLatestPosts();
  }

  private async fetchLatestPosts() {
    const targetTwitterAccounts = BotConfig.News.XSourceAccounts;

    // Check when we last fetched
    let latestFetchDate = await this.lastPostsFetchDate();
    if (!latestFetchDate) {
      // No entry yet? Fetch only since a few hours ago to save data
      latestFetchDate = moment().subtract(12, "hours").toDate();
    }

    // Fetch recent posts, not earlier than last time we checked
    this.logger.log(`Fetching recent X posts not earlier than ${latestFetchDate}`);
    const posts = await this.twitter.fetchAuthorsPosts(targetTwitterAccounts, moment(latestFetchDate));

    if (posts) {
      this.logger.log(`Got ${posts.length} posts from twitter api`);

      // Store every post that we don't have yet
      const newPosts: XPost[] = [];
      for (var post of posts) {
        const existingPost = await this.getDBPostByTwitterPostId(post.id);
        if (!existingPost) {
          const parentXPostId = post.referenced_tweets?.find(t => t.type === "replied_to")?.id;

          // Save post to database
          const dbPost = await this.prisma.xPost.create({
            data: {
              type: XPostType.ThirdPartyNews,
              text: post.text,
              authorId: post.author_id,
              postId: post.id,
              publishedAt: post.created_at,
              parentPostId: parentXPostId ? parentXPostId : null,
              rootPostId: parentXPostId ? post.conversation_id : post.id
            }
          });
          newPosts.push(dbPost);
        }
      }

      // Remember last fetch time
      await this.prisma.operationHistory.create({ data: { type: OperationHistoryType.FetchNewsPosts } });

      // Categorize
      await this.categorizeTweets();
    }

    // Rearm to continue checking later
    setTimeout(() => {
      this.fetchLatestPosts();
    }, FetchXPostsDelay);
  }

  private getDBPostByTwitterPostId(twitterPostId: string): Promise<XPost> {
    return this.prisma.xPost.findFirst({ where: { postId: twitterPostId } });
  }

  private async lastPostsFetchDate(): Promise<Date> {
    const mostRecentFetch = await this.prisma.operationHistory.findFirst({
      where: { type: OperationHistoryType.FetchNewsPosts },
      orderBy: { createdAt: "desc" }
    });

    return mostRecentFetch?.createdAt; // possibly undefined if just starting
  }

  private async categorizeTweets() {
    const recentPosts = await this.prisma.xPost.findMany({
      where: {
        type: XPostType.ThirdPartyNews,
        isRealNews: null,
        createdAt: { gt: moment().subtract(2, "days").toDate() } // care only about recent enough tweets for now
      },
      orderBy: { createdAt: "desc" },
    })

    if (recentPosts?.length > 0) {
      this.logger.log(`Categorizing ${recentPosts.length} recent tweets as real news or not`);

      for (var post of recentPosts) {
        await this.categorizeAsRealNews(post);
      }
    }
  }

  /**
   * Ask AI to evaluate if a post content provide real news/information, so we can filter out garbage
   * or not relevant content.
   */
  private async categorizeAsRealNews(post: XPost) {
    const tools = [
      categorizeNewsTool(this.logger, this.prisma, post) // ability to update a DB post with "isRealNews" info
    ];
    const mainAgent = categorizeNewsAgent(tools, post);

    const graph = new StateGraph(MessagesAnnotation).addNode("agent", mainAgent);
    graph.addEdge(START, "agent").addEdge("agent", END);
    const app = graph.compile();

    // Invoke tools targeted by the graph
    const result: { messages: BaseMessage[] } = await app.invoke({});
    await this.langchain.executeAllToolCalls(tools, result);
  }
}

