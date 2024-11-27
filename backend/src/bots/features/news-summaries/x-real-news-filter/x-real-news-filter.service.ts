import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { BotFeatureType, XPost } from "@prisma/client";
import moment from "moment";
import { Bot } from "src/bots/model/bot";
import { BotFeature } from "src/bots/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { prisma, xAccountsService } from "src/services";
import { categorizeNewsAgent } from "./categorize-news.agent";

/**
 * This service categorizes posts as real news or not
 */
export class XRealNewsFilterFeature extends BotFeature {
  private logger = new Logger("XRealNewsFilter");

  constructor(bot: Bot) {
    super(BotFeatureType.NewsSummaries_XRealNewsFilter, bot, 10);
  }

  public isEnabled(): boolean {
    return BotConfig.NewsSummaryBot.IsActive;
  }

  public scheduledExecution() {
    return this.categorizeFollowedNewsAccountsTweetsAsRealNews();
  }

  private async categorizeFollowedNewsAccountsTweetsAsRealNews() {
    // Retrieve user ids of accounts we are following for their news
    const targetAuthorAccounts = await xAccountsService().getXAccountsFromScreenNames(this.bot, BotConfig.NewsSummaryBot.News.XSourceAccounts)
    const targetAuthorIds = targetAuthorAccounts.map(a => a.userId);

    const recentPosts = await prisma().xPost.findMany({
      where: {
        botId: this.bot.id,
        xAccountUserId: { in: targetAuthorIds },
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
      .addNode("agent", categorizeNewsAgent(this, this.logger, post))
      .addEdge(START, "agent")
      .addEdge("agent", END);

    const app = graph.compile();
    await app.invoke({});
  }
}

