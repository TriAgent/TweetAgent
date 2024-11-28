import { forwardRef, HttpException, Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AIPrompt, BotFeatureConfig, Bot as DBBot, Prisma } from '@prisma/client';
import { AiPrompt as AiPromptDTO, Bot as BotDTO, BotFeatureConfig as BotFeatureConfigDTO } from "@x-ai-wallet-bot/common";
import { Subject } from 'rxjs';
import { AiPromptsService } from 'src/ai-prompts/ai-prompts.service';
import { Bot } from 'src/bots/model/bot';
import { PrismaService } from 'src/prisma/prisma.service';
import { BotsRunnerService } from './bot-runner.service';

const allowedBotUpdateKeys = ["name"];
const allowedPromptUpdateKeys = ["text"];
const allowedFeatureUpdateKeys = ["enabled"];

export type BotFeatureUpdate = {
  bot: Bot;
  updatedKey: Exclude<keyof BotFeatureConfigDTO, "id>">;
  update: BotFeatureConfig;
}

@Injectable()
export class BotsService implements OnApplicationBootstrap {
  private logger = new Logger("Bots");

  private bots: Bot[] = [];

  public onNewBot$ = new Subject<Bot>();
  public onBotFeatureUpdate$ = new Subject<BotFeatureUpdate>();

  constructor(
    private prisma: PrismaService,
    private aiPrompts: AiPromptsService,
    @Inject(forwardRef(() => BotsRunnerService)) private runner: BotsRunnerService
  ) { }

  public run() {
    this.runner.run();
  }

  async onApplicationBootstrap() {
    // Ensure all required prompts are ready for all bots
    const dbBots = await this.listDatabaseBots();
    for (const bot of dbBots) {
      this.bots.push(await Bot.newFromPrisma(bot));
    }
  }

  public async createBot() {
    const dbBot = await this.prisma.bot.create({
      data: {}
    });

    const bot = await Bot.newFromPrisma(dbBot);
    this.bots.push(bot);

    // Create all default prompts for the bot
    await this.aiPrompts.ensureBotRequiredPrompts(bot);

    this.onNewBot$.next(bot);

    this.logger.log("A new bot was just created");

    return dbBot;
  }

  public listDatabaseBots(): Promise<DBBot[]> {
    return this.prisma.bot.findMany();
  }

  public getBots(): Bot[] {
    return this.bots;
  }

  public getBotById(id: string): Bot {
    return this.bots.find(bot => bot.dbBot.id === id);
  }

  public updateBot(bot: BotDTO, key: string) {
    if (!(allowedBotUpdateKeys.includes(key)))
      throw new HttpException(`Not allowed to update field bot property ${key}`, 403);

    const updateData: Prisma.BotUpdateArgs["data"] = {};
    updateData[key] = bot[key];

    return this.prisma.bot.update({
      where: { id: bot.id },
      data: updateData
    });
  }

  public listBotPrompts(bot: DBBot): Promise<AIPrompt[]> {
    return this.prisma.aIPrompt.findMany({
      where: { botId: bot.id },
      orderBy: { key: "asc" }
    });
  }

  public updatePrompt(currentPrompt: AIPrompt, updatedPrompt: AiPromptDTO, key: Exclude<keyof AiPromptDTO, "id>">) {
    if (!(allowedPromptUpdateKeys.includes(key)))
      throw new HttpException(`Not allowed to update field prompt property ${key}`, 403);

    const updateData: Prisma.AIPromptUpdateArgs["data"] = {};
    updateData[key] = updatedPrompt[key];

    return this.prisma.aIPrompt.update({
      where: { id: currentPrompt.id },
      data: updateData
    });
  }

  public getBotFeatureConfigs(bot: DBBot, enabledOnly = false): Promise<BotFeatureConfig[]> {
    return this.prisma.botFeatureConfig.findMany({
      where: {
        botId: bot.id,
        ...(enabledOnly && { enabled: true })
      }
    });
  }

  public listBotFeatureConfigs(bot: DBBot): Promise<BotFeatureConfig[]> {
    return this.prisma.botFeatureConfig.findMany({
      where: { botId: bot.id },
      orderBy: { key: "asc" }
    });
  }

  public async updateBotFeatureConfig(currentFeature: BotFeatureConfig, updatedFeature: BotFeatureConfigDTO, key: Exclude<keyof BotFeatureConfigDTO, "id>">) {
    if (!(allowedFeatureUpdateKeys.includes(key)))
      throw new HttpException(`Not allowed to update feature property field ${key}`, 403);

    const updateData: Prisma.BotFeatureConfigUpdateArgs["data"] = {};
    updateData[key] = updatedFeature[key];

    if (key === "enabled")
      this.logger.warn(`Feature change: ${currentFeature.key} is now ${updatedFeature[key] ? "enabled" : "disabled"} for bot ${currentFeature.botId}`);

    const updatedFeatureConfig = await this.prisma.botFeatureConfig.update({
      where: { id: currentFeature.id },
      data: updateData
    });

    this.onBotFeatureUpdate$.next({
      bot: this.getBotById(currentFeature.botId),
      updatedKey: key,
      update: updatedFeatureConfig
    });

    return updatedFeatureConfig;
  }
}
