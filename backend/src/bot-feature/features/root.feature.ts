import { BotFeatureType } from '@prisma/client';
import { BotFeatureGroupType } from '@x-ai-wallet-bot/common';
import { BotFeature } from 'src/bot-feature/model/bot-feature';
import { BotFeatureProvider, BotFeatureProviderConfigBase } from 'src/bot-feature/model/bot-feature-provider';
import { Bot } from 'src/bots/model/bot';
import { wsDispatcherService } from 'src/services';
import { z, infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  enabled: z.boolean().describe('Activate or deactivate the whole bot')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

/**
 * We use a root feature so we can configure a few settings for the whole bot.
 */
export class RootFeatureProvider extends BotFeatureProvider<RootFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.Root,
      BotFeatureType.Root,
      `Root scheduler`,
      `Root feature that schedules all other features`,
      FeatureConfigFormat,
      (bot: Bot) => new RootFeature(this, bot)
    );
  }

  public getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: true
    }
  }
}

export class RootFeature extends BotFeature<FeatureConfigType> {
  constructor(provider: RootFeatureProvider, bot: Bot) {
    super(provider, bot, 5);
  }

  public async scheduledExecution() {
    let activeFeatures = await this.bot.getActiveFeatures();
    // Execute everything except this root feature itself.
    activeFeatures = activeFeatures.filter(feature => feature.provider.type !== this.provider.type);

    for (const feature of activeFeatures) {
      if (feature.canExecuteNow()) {
        wsDispatcherService().emitMostRecentFeatureAction(this.bot, feature, "scheduledExecution");

        await feature.scheduledExecution();
        feature.updateLastExecutionTime();

        wsDispatcherService().emitMostRecentFeatureAction(this.bot, feature, undefined);
      }
    }
  }
}