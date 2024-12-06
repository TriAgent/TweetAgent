import { Body, Controller, Get, HttpException, Post, Put, UseGuards } from '@nestjs/common';
import { Bot, BotFeature } from '@prisma/client';
import { Bot as BotDTO, BotFeature as BotFeatureConfigDTO, BotFeatureType, TwitterAuthenticationRequest } from "@x-ai-wallet-bot/common";
import { BotFeatureService } from 'src/bot-feature/bot-feature.service';
import { TwitterAuthService } from 'src/twitter/twitter-auth.service';
import { BotsService } from './bots.service';
import { ParamBot } from './decorators/bot-decorator';
import { ParamFeature } from './decorators/feature-decorator';
import { BotGuard } from './guards/bot-guard';
import { FeatureGuard } from './guards/feature-guard';

@Controller('bots')
export class BotsController {
  constructor(
    private bots: BotsService,
    private twitterAuthService: TwitterAuthService,
    private botFeatureService: BotFeatureService
  ) { }

  @Get()
  listBots() {
    return this.bots.listDatabaseBots();
  }

  @Post()
  createBot() {
    return this.bots.createBot();
  }

  @Put()
  updateBot(@Body() body: { bot: BotDTO, key: Exclude<keyof BotDTO, "id"> }) {
    return this.bots.updateBot(body.bot, body.key);
  }

  @Get(':botId/features')
  @UseGuards(BotGuard)
  async listBotFeatures(@ParamBot() bot: Bot) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.bots.listBotFeatures(bot);
  }

  @Put(':botId/features/:featureId')
  @UseGuards(BotGuard, FeatureGuard)
  async updateFeature(@ParamFeature() feature, @Body() body: { feature: BotFeatureConfigDTO, key: Exclude<keyof BotFeatureConfigDTO, "id>"> }) {
    if (!feature)
      throw new HttpException(`Feature not found`, 404);

    return this.bots.updateBotFeature(feature, body.feature, body.key);
  }

  @Post(':botId/features/:featureId/config/reset')
  @UseGuards(BotGuard, FeatureGuard)
  async resetFeatureConfig(@ParamBot() dbBot: Bot, @ParamFeature() dbFeature: BotFeature) {
    if (!dbFeature)
      throw new HttpException(`Feature not found`, 404);

    const bot = this.bots.getBotById(dbBot.id);
    const feature = bot.getFeatureByType(dbFeature.type as BotFeatureType);

    return this.botFeatureService.resetBotFeatureConfig(bot, feature);
  }

  @Post(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public startTwitterAuthentication(@ParamBot() bot: Bot) {
    return this.twitterAuthService.startRemoteUserAuth(bot);
  }

  @Put(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public finalizeTwitterAuthenticationWithPIN(@ParamBot() bot: Bot, @Body() body: { request: TwitterAuthenticationRequest, pinCode: string }) {
    return this.twitterAuthService.finalizeTwitterAuthenticationWithPIN(bot, body.request, body.pinCode);
  }

  @Get(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public getTwitterAuthenticationStatus(@ParamBot() bot: Bot) {
    return this.twitterAuthService.getAuthenticationStatus(bot);
  }
}
