import { Injectable } from "@nestjs/common";
import { BotFeatureType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AirdropSenderFeature } from "./features/airdrop-contest/airdrop-sender/airdrop-sender.feature";
import { AirdropSnapshotFeature } from "./features/airdrop-contest/airdrop-snapshot/airdrop-snapshot.feature";
import { XPostAirdropAddressFeature } from "./features/airdrop-contest/x-post-airdrop-address/x-post-airdrop-address.feature";
import { XPostContestHandlerFeature } from "./features/airdrop-contest/x-post-contest-handler/x-post-contest-handler.feature";
import { XPostContestReposterFeature } from "./features/airdrop-contest/x-post-contest-reposter/x-post-contest-reposter.feature";
import { XPostFetcherFeature } from "./features/core/x-posts-fetcher/x-post-fetcher.feature";
import { XPostsHandlerFeature } from "./features/core/x-posts-handler/x-posts-handler.feature";
import { XPostSenderFeature } from "./features/core/x-posts-sender/x-post-sender.feature";
import { XNewsSummaryReplierFeature } from "./features/news-summaries/x-news-summary-replier/x-news-summary-replier.feature";
import { XNewsSummaryWriterFeature } from "./features/news-summaries/x-news-summary-writer/x-summary-writer.service";
import { XRealNewsFilterFeature } from "./features/news-summaries/x-real-news-filter/x-real-news-filter.service";
import { Bot } from "./model/bot";
import { BotFeature } from "./model/bot-feature";

@Injectable()
export class BotFeaturesService {
  private features: BotFeature[];

  constructor(private prisma: PrismaService) { }

  /* 
    public registerFeatures(features: BotFeature[]) {
      this.features = features;
    }
   */
  /*  public getFeatures(): BotFeature[] {
     return this.features;
   } */

  /**
   * Instantiates a feature instance specific to a bot
   */
  public async newFromKey(bot: Bot, featureKey: BotFeatureType): Promise<BotFeature> {
    let feature: BotFeature;

    /* featuresService.registerFeatures([
      xPostsFetcher, // Fetches and caches X Posts
      xPostsHandler, // Handle unanswered third party posts and generate replies when possible.
      xPostsSender, // Send our pending posts/replies to X
      xNewsSummaryWriter, // From time to time, write news summary from cached news posts, and publish to X
      xNewsSummaryReplier, // Write replies to users posts following our news summary posts
      xRealNewsFilter, // Browses recent posts from followed X news accounts, and classifies posts as real news or not (used by the news summary writer).
      xPostContestHandler, // Classifies upcoming X posts as eligible for the airdrop contest or not
      xPostContestReposter, // RTs user posts from time to time, for the airdrop contest
      xPostAirdropAddress, // Collects user airdrop addresses from X posts and acknowledges with a reply when successfully handled
      airdropSnapshot, // Elects best posts and dispatches airdrop tokens to authors
      airdropSender, // Sends airdrop tokens on chain
    ]); */

    const mapping = {
      // Core
      [BotFeatureType.Core_XPostsHandler]: () => new XPostsHandlerFeature(bot),
      [BotFeatureType.Core_XPostsSender]: () => new XPostSenderFeature(bot),
      [BotFeatureType.Core_XPostsFetcher]: () => new XPostFetcherFeature(bot),
      // Airdrop contest
      [BotFeatureType.AirdropContest_AirdropSender]: () => new AirdropSenderFeature(bot),
      [BotFeatureType.AirdropContest_AirdropSnapshot]: () => new AirdropSnapshotFeature(bot),
      [BotFeatureType.AirdropContest_XPostAirdropAddress]: () => new XPostAirdropAddressFeature(bot),
      [BotFeatureType.AirdropContest_XPostContestHandler]: () => new XPostContestHandlerFeature(bot),
      [BotFeatureType.AirdropContest_XPostContestReposter]: () => new XPostContestReposterFeature(bot),
      // News summaries
      [BotFeatureType.NewsSummaries_XNewsSummaryWriter]: () => new XNewsSummaryWriterFeature(bot),
      [BotFeatureType.NewsSummaries_XNewsSummaryReplier]: () => new XNewsSummaryReplierFeature(bot),
      [BotFeatureType.NewsSummaries_XRealNewsFilter]: () => new XRealNewsFilterFeature(bot),
    }

    if (!(featureKey in mapping))
      throw new Error(`Feature "${featureKey}" is not supported`);

    feature = mapping[featureKey]();

    // Safety check
    if (feature.runLoopMinIntervalSec === undefined && feature.scheduledExecution !== undefined)
      throw new Error(`Feature ${feature.type} has an execution method but no loop interval configured!`);

    await feature.initialize();

    return feature;
  }

  /**
   * Ensures all required bot features types are created in database for the given bot
   */
  public async ensureBotRequiredFeatures(bot: Bot) {
    const requiredBotFeatureTypes = Object.values(BotFeatureType);
    for (const requiredBotFeatureType of requiredBotFeatureTypes) {
      await this.prisma.botFeatureConfig.upsert({
        where: {
          botId_key: {
            botId: bot.dbBot.id,
            key: requiredBotFeatureType
          }
        },
        create: {
          bot: { connect: { id: bot.dbBot.id } },
          key: requiredBotFeatureType,
          enabled: false,
          config: {}
        },
        update: {}
      })
    }
  }
}