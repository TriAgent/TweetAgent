import { BotFeatureType } from '@prisma/client';
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
      BotFeatureType.Core_XPostsSender,
      `Send our pending posts/replies to X`,
      FeatureConfigFormat,
      (bot: Bot) => new XPostSenderFeature(this, bot)
    );
  }

  protected getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
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