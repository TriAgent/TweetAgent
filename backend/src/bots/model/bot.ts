import { BotFeatureConfig, Bot as DBBot } from "@prisma/client";
import { aiPromptsService, botFeaturesService, botsService } from "src/services";
import { BotFeature } from "./bot-feature";

/**
 * High level class helper on top of database's Bot type.
 */
export class Bot {
  private features: BotFeature[];

  private constructor(public dbBot: DBBot) { }

  public static async newFromPrisma(dbBot: DBBot): Promise<Bot> {
    const bot = new Bot(dbBot);

    await botFeaturesService().ensureBotRequiredFeatures(bot);
    await aiPromptsService().ensureBotRequiredPrompts(bot);

    const featureConfigs = await bot.getActiveFeatureConfigs();
    for (const featureConfig of featureConfigs) {
      const feature = await botFeaturesService().newFromKey(bot, featureConfig.key);
      bot.features.push(feature);
    }

    return bot;
  }

  public getActiveFeatureConfigs(): Promise<BotFeatureConfig[]> {
    return botsService().getBotFeatureConfigs(this.dbBot, true);
  }

  public getActiveFeatures(): BotFeature[] {
    return this.features;
  }
}