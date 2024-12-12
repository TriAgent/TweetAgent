import { BotFeature as DBBotFeature } from '@prisma/client';
import { BotFeatureGroupType, BotFeatureType } from '@x-ai-wallet-bot/common';
import moment from 'moment';
import { BotFeature } from 'src/bot-feature/model/bot-feature';
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from 'src/bot-feature/model/bot-feature-provider';
import { Bot } from 'src/bots/model/bot';
import { AppLogger } from 'src/logs/app-logger';
import { xPostsService } from 'src/services';
import { z, infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  minPostInterval: z.number().describe('Min delay (in seconds) between 2 posts publishing (to avoid spamming X)')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostsSenderProvider extends BotFeatureProvider<XPostSenderFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.XCore,
      BotFeatureType.XCore_PostsSender,
      `Post sender`,
      `Sends our unpublished posts (in database - from our bot) to X through X api`,
      FeatureConfigFormat,
      (bot, dbFeature) => new XPostSenderFeature(this, bot, dbFeature)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: false,
      minPostInterval: 1 * 60 // 1 minute
    }
  }
}

export class XPostSenderFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostSender", this.bot);

  constructor(provider: XPostsSenderProvider, bot: Bot, feature: DBBotFeature) {
    super(provider, bot, feature, 5);
  }

  public async scheduledExecution() {
    const mostRecentlyPublishedPost = await xPostsService().getMostRecentlyPublishedPost(this.bot);
    if (!mostRecentlyPublishedPost || moment().diff(mostRecentlyPublishedPost.publishedAt, "seconds") > this.config.minPostInterval) {
      // Send our pending posts
      await xPostsService().sendNextPendingXPost();
    }
  }
}