import { BaseMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import * as moment from "moment";
import { BotConfig } from "src/config/bot-config";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterService } from "src/twitter/twitter.service";
import { runEverySeconds } from "src/utils/run-every-seconds";
import { XAccountsService } from "src/xaccounts/xaccounts.service";
import { XPostsService } from "src/xposts/xposts.service";
import { categorizeNewsAgent } from "./agents/categorize-news.agent";
import { categorizeNewsTool } from "./tools/categorize-news.tool";

/**
 * This service categorizes posts as real news or not
 */
@Injectable()
export class XNewsPostsService {
  private logger = new Logger("XNewsPosts");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private xPosts: XPostsService,
    private xAccounts: XAccountsService,
    private langchain: LangchainService
  ) { }

  public run() {
    runEverySeconds(this.categorizeTweetsAsRealNews, 10);
  }

  private async categorizeTweetsAsRealNews() {
    // Retrieve user ids of accounts we are following for their news
    const targetAuthorAccounts = await this.xAccounts.getXAccountsFromScreenNames(BotConfig.NewsSummaryBot.News.XSourceAccounts)
    const targetAuthorIds = targetAuthorAccounts.map(a => a.userId);

    const recentPosts = await this.prisma.xPost.findMany({
      where: {
        authorId: { in: targetAuthorIds },
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

