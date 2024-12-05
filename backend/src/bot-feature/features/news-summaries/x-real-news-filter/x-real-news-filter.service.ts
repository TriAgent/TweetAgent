import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { XPost } from "@prisma/client";
import moment from "moment";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { Bot } from "src/bots/model/bot";
import { BotConfig } from "src/config/bot-config";
import { AppLogger } from "src/logs/app-logger";
import { prisma, xAccountsService } from "src/services";
import { categorizeNewsAgent } from "./categorize-news.agent";

import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { BotFeatureProvider, BotFeatureProviderConfigBase } from "src/bot-feature/model/bot-feature-provider";
import { infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  //snapshotInterval: z.number().describe('Min delay (in seconds) between 2 airdrop snapshots')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XRealNewsFilterProvider extends BotFeatureProvider<XRealNewsFilterFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.NewsSummaries,
      BotFeatureType.NewsSummaries_XRealNewsFilter,
      `Real news classifier`,
      `Classifies posts as real news or not (used by the news summary writer).`,
      FeatureConfigFormat,
      (bot: Bot) => new XRealNewsFilterFeature(this, bot)
    );
  }

  public getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      //snapshotInterval: 24 * 60 * 60 // 1 per day
    }
  }
}

/**
 * This service categorizes posts as real news or not
 */
export class XRealNewsFilterFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XRealNewsFilter", this.bot);

  constructor(provider: XRealNewsFilterProvider, bot: Bot) {
    super(provider, bot, 10);
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

