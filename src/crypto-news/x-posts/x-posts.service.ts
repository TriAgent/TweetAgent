import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { OperationHistoryType, XPost } from "@prisma/client";
import * as moment from "moment";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterService } from "src/twitter/twitter.service";
import { z } from "zod";

const FetchXPostsDelay = 1 * 60 * 60 * 1000; // 1 hour

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
    const targetTwitterAccounts = [
      'BitcoinMagazine',
      'crypto' // bloomberg crypto
    ];

    // Check when we last fetched
    let latestFetchDate = await this.lastPostsFetchDate();
    if (!latestFetchDate) {
      // No entry yet? Fetch only since a few hours ago to save data
      latestFetchDate = moment().subtract(12, "hours").toDate();
    }

    // Fetch recent posts, not earlier than last time we checked
    this.logger.log(`Fetching recent X posts not earlier than ${latestFetchDate}`);
    const posts = await this.twitter.fetchAuthorsPosts(targetTwitterAccounts, moment(latestFetchDate));
    this.logger.log(`Got ${posts.length} posts from twitter api`);

    // Store every post that we don't have yet
    const newPosts: XPost[] = [];
    for (var post of posts) {
      const existingPost = await this.getDBPostByTwitterPostId(post.id);
      if (!existingPost) {
        const parentXPost = post.referenced_tweets?.find(t => t.type === "replied_to");

        // Save post to database
        const dbPost = await this.prisma.xPost.create({
          data: {
            text: post.text,
            authorId: post.author_id,
            postId: post.id,
            contentDate: post.created_at,
            isNewsPost: true,
            parentPostId: parentXPost ? parentXPost.id : null,
            rootPostId: parentXPost ? post.conversation_id : null
          }
        });
        newPosts.push(dbPost);
      }
    }

    // Remember last fetch time
    await this.prisma.operationHistory.create({ data: { type: OperationHistoryType.FetchNewsPosts } });

    // Categorize
    await this.categorizeTweets();

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
    // Tools setup
    const categorizeNewsTool = tool(
      async ({ text, isNews }: { text: string, isNews: boolean }) => {
        this.logger.log(`Categorizing tweet as ${isNews ? "REAL NEWS" : "NOT REAL NEWS"}: ${text}`);

        await this.prisma.xPost.update({
          where: { id: post.id },
          data: { isRealNews: isNews }
        });
      },
      {
        name: "save_categorization",
        description: "Saves categorization of a twitter post as real news or not",
        schema: z.object({
          text: z.string().describe("Textual tweet content"),
          isNews: z.boolean().describe("Whether this tweet can be considered as a real bitcoin news or not")
        })
      });
    const tools = [categorizeNewsTool];

    // Configure LLM model
    const model = this.langchain.getModel().bindTools(tools);

    // Base entry point
    const mainAgent = async (state: typeof MessagesAnnotation.State) => {
      const SYSTEM_TEMPLATE = `
      Here is a twitter post related to crypto. You have to evaluate if this post is a 
      real news that brings new information to users about the crypto landscape.
      ---------------- 
      {tweetContent}`;

      // No actual user message, everything is in the system prompt.
      const prompt = ChatPromptTemplate.fromMessages([["system", SYSTEM_TEMPLATE]]);

      const response = await prompt.pipe(model).invoke({ tweetContent: post.text });
      return { messages: [response] };
    };

    // Graph and nodes
    const graph = new StateGraph(MessagesAnnotation).addNode("agent", mainAgent);

    // Edges (paths)
    graph.addEdge(START, "agent").addEdge("agent", END);

    const app = graph.compile();

    // Invoke graph
    const result: { messages: BaseMessage[] } = await app.invoke({});
    if (result) {
      // Execute the categorization tool based on parameters determined by the model
      const firstMessage: AIMessage = result.messages[0]; // We should have only one output message

      // Normally only one tool call as only one tweet is provided.
      for (var toolCall of firstMessage.tool_calls) {
        const targetTool = tools.find(t => t.name === toolCall.name);
        await targetTool.invoke(toolCall.args);
      }
    }
  }
}

