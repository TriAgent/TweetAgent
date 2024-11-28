import { BotFeatureConfig, BotFeatureType, Bot as DBBot } from "@prisma/client";
import { aiPromptsService, botFeaturesService, botsService, xAccountsService } from "src/services";
import { BotFeatureUpdate } from "../bots.service";
import { BotFeature } from "./bot-feature";

/**
 * High level class helper on top of database's Bot type.
 */
export class Bot {
  private features: BotFeature[] = [];

  private constructor(public dbBot: DBBot) {
    botsService().onBotFeatureUpdate$.subscribe(e => this.handleUpdatedFeatureConfig(e));
  }

  public static async newFromPrisma(dbBot: DBBot): Promise<Bot> {
    const bot = new Bot(dbBot);

    if (dbBot.twitterUserId)
      await xAccountsService().ensureXAccount(bot, dbBot.twitterUserId);

    await botFeaturesService().ensureBotRequiredFeatures(bot);
    await aiPromptsService().ensureBotRequiredPrompts(bot);

    const featureConfigs = await bot.getActiveFeatureConfigs();
    for (const featureConfig of featureConfigs) {
      await bot.addFeatureFromFeatureConfig(featureConfig);
    }

    return bot;
  }

  public get id(): string {
    return this.dbBot.id;
  }

  public getActiveFeatureConfigs(): Promise<BotFeatureConfig[]> {
    return botsService().getBotFeatureConfigs(this.dbBot, true);
  }

  public getActiveFeatures(): BotFeature[] {
    return this.features;
  }

  private async addFeatureFromFeatureConfig(featureConfig: BotFeatureConfig) {
    const feature = await botFeaturesService().newFromKey(this, featureConfig.key);
    this.features.push(feature);
  }

  private removeFeature(type: BotFeatureType) {
    const index = this.features.findIndex(f => f.type === type);
    if (index >= 0)
      this.features.splice(index);
  }

  /**
   * Called whenever one of the features gets changed (enabled, config...)
   */
  private async handleUpdatedFeatureConfig(e: BotFeatureUpdate) {
    if (e.bot.id !== this.id)
      return;

    if (e.updatedKey === "enabled") {
      const isNowEnabled = e.update["enabled"];
      if (isNowEnabled)
        await this.addFeatureFromFeatureConfig(e.update);
      else
        this.removeFeature(e.update.key);
    }
  }
}