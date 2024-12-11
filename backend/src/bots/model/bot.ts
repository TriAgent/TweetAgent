import { Bot as DBBot, BotFeature as DBBotFeature } from "@prisma/client";
import { BotFeatureType } from "@x-ai-wallet-bot/common";
import { RootSchedulerFeature } from "src/bot-feature/features/core/root-scheduler/root-scheduler.feature";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { AppLogger } from "src/logs/app-logger";
import { botFeatureService, botsService, prisma, twitterAuthService, xAccountsService } from "src/services";
import { TwitterAuthEvent } from "src/twitter/twitter-auth.service";
import { BotFeatureUpdate, BotUpdate } from "../bots.service";

/**
 * High level class helper on top of database's Bot type.
 */
export class Bot {
  private features: AnyBotFeature[] = [];
  private logger = new AppLogger("Bot");

  private constructor(public dbBot: DBBot) {
    botsService().onBotUpdate$.subscribe(e => this.handleBotUpdate(e));
    botsService().onBotFeatureUpdate$.subscribe(e => this.handleUpdatedFeature(e));
    twitterAuthService().onTwitterAuth$.subscribe(e => this.handleTwitterAuth(e));
  }

  public static async newFromPrisma(dbBot: DBBot): Promise<Bot> {
    const bot = new Bot(dbBot);

    if (dbBot.twitterUserId)
      await xAccountsService().ensureXAccount(bot, dbBot.twitterUserId);

    await botFeatureService().ensureBotRequiredFeatures(bot);

    const features = await bot.getAllDBFeatures();
    for (const feature of features) {
      await bot.newFeatureFromDBFeature(feature);
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

  public getFeatureByType<T extends AnyBotFeature = AnyBotFeature>(type: BotFeatureType): T {
    return this.features.find(feature => feature.provider.type === type) as T;
  }

  public getRootFeature(): RootSchedulerFeature {
    return this.getFeatureByType(BotFeatureType.Core_RootScheduler) as RootSchedulerFeature;
  }

  private async newFeatureFromDBFeature(dbFeature: DBBotFeature) {
    const feature = await botFeatureService().newFromDBFeature(this, dbFeature);
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
  private async handleUpdatedFeature(e: BotFeatureUpdate) {
    if (e.bot.id !== this.id)
      return;

    const feature = this.features.find(f => f.provider.type === e.update.type);

    if (e.updatedKey === "config") {
      feature.updateDBFeature(e.update);
    }
  }

  private async handleTwitterAuth(e: TwitterAuthEvent) {
    if (e.botId !== this.id)
      return;

    // Update bot in DB
    const updatedBot = await prisma().bot.update({
      where: { id: e.botId },
      data: { ...e.info }
    });

    this.dbBot = updatedBot;
  }

  /**
   * Tells if this bot is mentioned in the post text
   */
  public isMentionedInPostText(text: string): boolean {
    return text.indexOf(`@${this.dbBot.twitterUserScreenName}`) >= 0;
  }
}