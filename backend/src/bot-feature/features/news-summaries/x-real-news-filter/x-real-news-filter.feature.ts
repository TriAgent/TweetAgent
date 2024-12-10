import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { BotFeature as DBBotFeature, XPost } from "@prisma/client";
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import moment from "moment";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { prisma } from "src/services";
import { z, infer as zodInfer } from "zod";
import { XPostFetcherFeature } from "../../x-core/x-posts-fetcher/x-post-fetcher.feature";
import { categorizeNewsAgent } from "./categorize-news.agent";
import { categorizeNews } from "./default-prompts";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  _prompts: z.object({
    categorizeNews: z.string()
  })
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
      (bot, dbFeature) => new XRealNewsFilterFeature(this, bot, dbFeature)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      _prompts: {
        categorizeNews
      }
    }
  }
}

/**
 * This service categorizes posts as real news or not
 */
export class XRealNewsFilterFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XRealNewsFilter", this.bot);

  constructor(provider: XRealNewsFilterProvider, bot: Bot, dbFeature: DBBotFeature) {
    super(provider, bot, dbFeature, 10);
  }

  public scheduledExecution() {
    return this.categorizeFollowedNewsAccountsTweetsAsRealNews();
  }

  private async categorizeFollowedNewsAccountsTweetsAsRealNews() {
    // Retrieve user ids of accounts we are following for their news
    const postFetcher = this.bot.getFeatureByType(BotFeatureType.XCore_PostFetcher) as XPostFetcherFeature;
    const { targetAuthorIds } = await postFetcher.getMonitoredNewsAccountList();

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

