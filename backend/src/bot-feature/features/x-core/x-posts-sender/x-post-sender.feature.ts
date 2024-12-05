import { BotFeatureGroupType, BotFeatureType } from '@x-ai-wallet-bot/common';
import { BotFeature } from 'src/bot-feature/model/bot-feature';
import { BotFeatureProvider, BotFeatureProviderConfigBase } from 'src/bot-feature/model/bot-feature-provider';
import { Bot } from 'src/bots/model/bot';
import { AppLogger } from 'src/logs/app-logger';
import { xPostsService } from 'src/services';
import { infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  //snapshotInterval: z.number().describe('Min delay (in seconds) between 2 airdrop snapshots')
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
      (bot: Bot) => new XPostSenderFeature(this, bot)
    );
  }

  public getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: false,
      //snapshotInterval: 24 * 60 * 60 // 1 per day
    }
  }
}

export class XPostSenderFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostSender", this.bot);

  constructor(provider: XPostsSenderProvider, bot: Bot) {
    super(provider, bot, 5);
  }

  public async scheduledExecution() {
    // Send our pending posts
    await xPostsService().sendPendingXPosts();
  }
}