import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import * as moment from "moment";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { LangchainService } from "src/langchain/langchain.service";
import { PrismaService } from "src/prisma/prisma.service";
import { XAccountsService } from "src/xaccounts/xaccounts.service";
import { categorizeNewsAgent } from "./categorize-news.agent";

/**
 * This service categorizes posts as real news or not
 */
@Injectable()
export class XRealNewsFilterService extends BotFeature {
  private logger = new Logger("XRealNewsFilter");

  constructor(
    private prisma: PrismaService,
    private xAccounts: XAccountsService,
    private langchain: LangchainService
  ) {
    super(10);
  }

  public scheduledExecution() {
    return this.categorizeFollowedNewsAccountsTweetsAsRealNews();
  }

  private async categorizeFollowedNewsAccountsTweetsAsRealNews() {
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
    const graph = new StateGraph(MessagesAnnotation)
      .addNode("agent", categorizeNewsAgent(this.logger, post))
      .addEdge(START, "agent")
      .addEdge("agent", END);

    const app = graph.compile();
    await app.invoke({});
  }
}
