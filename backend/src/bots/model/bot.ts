import { BotFeatureType, Bot as DBBot, BotFeature as DBBotFeature } from "@prisma/client";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { aiPromptsService, botFeatureService, botsService, xAccountsService } from "src/services";
import { BotFeatureUpdate } from "../bots.service";

/**
 * High level class helper on top of database's Bot type.
 */
export class Bot {
  private features: AnyBotFeature[] = [];

  private constructor(public dbBot: DBBot) {
    botsService().onBotFeatureUpdate$.subscribe(e => this.handleUpdatedFeatureConfig(e));
  }

  public static async newFromPrisma(dbBot: DBBot): Promise<Bot> {
    const bot = new Bot(dbBot);

    if (dbBot.twitterUserId)
      await xAccountsService().ensureXAccount(bot, dbBot.twitterUserId);

    await botFeatureService().ensureBotRequiredFeatures(bot);
    await aiPromptsService().ensureBotRequiredPrompts(bot);

    const featureConfigs = await bot.getActiveDBFeatures();
    for (const featureConfig of featureConfigs) {
      await bot.newFeatureFromDBFeature(featureConfig);
    }

    return bot;
  }

  public get id(): string {
    return this.dbBot.id;
  }

  public getActiveDBFeatures(): Promise<DBBotFeature[]> {
    return botsService().getBotFeatures(this.dbBot, true);
  }

  public getActiveFeatures(): AnyBotFeature[] {
    return this.features;
  }

  private async newFeatureFromDBFeature(dbFeature: DBBotFeature) {
    const feature = await botFeatureService().newFromKey(this, dbFeature.key);
    this.features.push(feature);
  }

  private removeFeature(type: BotFeatureType) {
    const index = this.features.findIndex(f => f.provider.type === type);
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
        await this.newFeatureFromDBFeature(e.update);
      else
        this.removeFeature(e.update.key);
    }
  }
}