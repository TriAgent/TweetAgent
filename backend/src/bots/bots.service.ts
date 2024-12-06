import { forwardRef, HttpException, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BotFeature, Bot as DBBot, Prisma } from '@prisma/client';
import { Bot as BotDTO, BotFeature as BotFeatureDTO } from "@x-ai-wallet-bot/common";
import { Subject } from 'rxjs';
import { Bot } from 'src/bots/model/bot';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { BotsRunnerService } from './bot-runner.service';

const allowedBotUpdateKeys = ["name"];
const allowedFeatureUpdateKeys = ["config"];

/**
 * One of the bot properties has been updated
 */
export type BotUpdate = {
  bot: Bot;
  update: DBBot;
}

export type BotFeatureUpdate = {
  bot: Bot;
  updatedKey: string;
  update: BotFeature;
}

@Injectable()
export class BotsService implements OnApplicationBootstrap {
  private logger = new AppLogger("Bots");

  private bots: Bot[] = [];

  public onNewBot$ = new Subject<Bot>();
  public onBotUpdate$ = new Subject<BotUpdate>();
  public onBotFeatureUpdate$ = new Subject<BotFeatureUpdate>();

  constructor(
    private prisma: PrismaService,
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

  public async updateBot(bot: BotDTO, key: string) {
    if (!(allowedBotUpdateKeys.includes(key)))
      throw new HttpException(`Not allowed to update field bot property ${key}`, 403);

    const updateData: Prisma.BotUpdateArgs["data"] = {};
    updateData[key] = bot[key];

    const updatedBot = await this.prisma.bot.update({
      where: { id: bot.id },
      data: updateData
    });

    this.onBotUpdate$.next({
      bot: this.getBotById(bot.id),
      update: updatedBot
    })

    return updatedBot;
  }


  public getBotFeatures(bot: DBBot, enabledOnly = false): Promise<BotFeature[]> {
    return this.prisma.botFeature.findMany({
      where: {
        botId: bot.id,
        ...(enabledOnly && { config: { path: ['enabled'], equals: true } })
      }
    });
  }

  public listBotFeatures(bot: DBBot): Promise<BotFeature[]> {
    return this.prisma.botFeature.findMany({
      where: { botId: bot.id },
      orderBy: { type: "asc" }
    });
  }

  public async updateBotFeature(currentFeature: BotFeature, updatedFeatureDTO: BotFeatureDTO, key: string) {
    if (!(allowedFeatureUpdateKeys.includes(key)))
      throw new HttpException(`Not allowed to update feature property field ${key}`, 403);

    const updateData: Prisma.BotFeatureUpdateArgs["data"] = {};
    updateData[key] = updatedFeatureDTO[key];

    const updatedFeature = await this.prisma.botFeature.update({
      where: { id: currentFeature.id },
      data: updateData
    });

    this.onBotFeatureUpdate$.next({
      bot: this.getBotById(currentFeature.botId),
      updatedKey: key,
      update: updatedFeature
    });

    return updatedFeatureDTO;
  }
}
