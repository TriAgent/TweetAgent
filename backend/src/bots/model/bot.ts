import { BotFeatureType, Bot as DBBot, BotFeature as DBBotFeature } from "@prisma/client";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { AppLogger } from "src/logs/app-logger";
import { aiPromptsService, botFeatureService, botsService, xAccountsService } from "src/services";
import { BotFeatureUpdate, BotUpdate } from "../bots.service";

/**
 * High level class helper on top of database's Bot type.
 */
export class Bot {
  private features: AnyBotFeature[] = [];
  private logger = new AppLogger("Bot");

  private constructor(public dbBot: DBBot) {
    botsService().onBotUpdate$.subscribe(e => this.handleBotUpdate(e));
    botsService().onBotFeatureUpdate$.subscribe(e => this.handleUpdatedFeatureConfig(e));
  }

  public static async newFromPrisma(dbBot: DBBot): Promise<Bot> {
    const bot = new Bot(dbBot);

    if (dbBot.twitterUserId)
      await xAccountsService().ensureXAccount(bot, dbBot.twitterUserId);

    await botFeatureService().ensureBotRequiredFeatures(bot);
    await aiPromptsService().ensureBotRequiredPrompts(bot);

    const featureConfigs = await bot.getAllDBFeatures();
    for (const featureConfig of featureConfigs) {
      await bot.newFeatureFromDBFeature(featureConfig);
    }

    return bot;
  }

  public get id(): string {
    return this.dbBot.id;
  }

  public getAllDBFeatures(): Promise<DBBotFeature[]> {
    return botsService().getBotFeatures(this.dbBot, false);
  }

  public getActiveFeatures(): AnyBotFeature[] {
    return this.features;
  }

  private async newFeatureFromDBFeature(dbFeature: DBBotFeature) {
    const feature = await botFeatureService().newFromKey(this, dbFeature.key);
    feature.updateConfig(dbFeature.config as any);
    this.features.push(feature);
  }

  private removeFeature(type: BotFeatureType) {
    const index = this.features.findIndex(f => f.provider.type === type);
    if (index >= 0)
      this.features.splice(index);
  }

  private async handleBotUpdate(e: BotUpdate) {
    if (e.bot.id !== this.id)
      return;

    // Update reference to latest DB content (eg: twitter linked account)
    this.dbBot = e.update;
  }

  /**
   * Called whenever one of the features gets changed (enabled, config...)
   */
  private async handleUpdatedFeatureConfig(e: BotFeatureUpdate) {
    if (e.bot.id !== this.id)
      return;

    const feature = this.features.find(f => f.provider.type === e.update.key);

    if (e.updatedKey === "config") {
      feature.updateConfig(e.update.config as any);
    }
  }
}