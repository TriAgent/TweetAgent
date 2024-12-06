import { BotFeatureGroupType, BotFeatureType } from '@x-ai-wallet-bot/common';
import { BotFeature } from 'src/bot-feature/model/bot-feature';
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from 'src/bot-feature/model/bot-feature-provider';
import { Bot } from 'src/bots/model/bot';
import { wsDispatcherService } from 'src/services';
import { z, infer as zodInfer } from "zod";
import { personality } from './default-prompts';

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  enabled: z.boolean().describe('Activate or deactivate the whole bot'),
  _prompts: z.object({
    personality: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

/**
 * We use a root feature so we can configure a few settings for the whole bot.
 */
export class RootSchedulerFeatureProvider extends BotFeatureProvider<RootSchedulerFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.Core,
      BotFeatureType.Core_RootScheduler,
      `Root`,
      `Root feature that schedules all other features and allows global bot configurations. If this feature gets disabled, nothing else run.`,
      FeatureConfigFormat,
      (bot: Bot) => new RootSchedulerFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      _prompts: {
        personality
      }
    }
  }
}

export class RootSchedulerFeature extends BotFeature<FeatureConfigType> {
  constructor(provider: RootSchedulerFeatureProvider, bot: Bot) {
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