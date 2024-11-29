import { Body, Controller, Get, HttpException, Post, Put, UseGuards } from '@nestjs/common';
import { Bot } from '@prisma/client';
import { AiPrompt as AiPromptDTO, Bot as BotDTO, BotFeatureConfig as BotFeatureConfigDTO, TwitterAuthenticationRequest } from "@x-ai-wallet-bot/common";
import { ParamPrompt } from 'src/bots/decorators/prompt-decorator';
import { PromptGuard } from 'src/bots/guards/prompt-guard';
import { TwitterAuthService } from 'src/twitter/twitter-auth.service';
import { XPostsService } from 'src/xposts/xposts.service';
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
    private xPosts: XPostsService
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

  @Get(':botId/prompts')
  @UseGuards(BotGuard)
  async listBotPrompts(@ParamBot() bot: Bot) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.bots.listBotPrompts(bot);
  }

  @Put(':botId/prompts/:promptId')
  @UseGuards(BotGuard, PromptGuard)
  async updatePrompt(@ParamPrompt() prompt, @Body() body: { prompt: AiPromptDTO, key: Exclude<keyof AiPromptDTO, "id>"> }) {
    if (!prompt)
      throw new HttpException(`Prompt not found`, 404);

    return this.bots.updatePrompt(prompt, body.prompt, body.key);
  }

  @Get(':botId/features')
  @UseGuards(BotGuard)
  async listBotFeatures(@ParamBot() bot: Bot) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.bots.listBotFeatureConfigs(bot);
  }

  @Put(':botId/features/:featureId')
  @UseGuards(BotGuard, FeatureGuard)
  async updateFeature(@ParamFeature() feature, @Body() body: { feature: BotFeatureConfigDTO, key: Exclude<keyof BotFeatureConfigDTO, "id>"> }) {
    if (!feature)
      throw new HttpException(`Feature not found`, 404);

    return this.bots.updateBotFeatureConfig(feature, body.feature, body.key);
  }

  @Post(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public startTwitterAuthentication(@ParamBot() bot: Bot) {
    return this.twitterAuthService.startRemoteUserAuth(bot);
  }

  @Put(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public finalizeTwitterAuthenticationWithPIN(@ParamBot() bot: Bot, @Body() body: { request: TwitterAuthenticationRequest, pinCode: string }) {
    console.log("body", body)
    return this.twitterAuthService.finalizeTwitterAuthenticationWithPIN(bot, body.request, body.pinCode);
  }

  @Get(':botId/twitter/auth')
  @UseGuards(BotGuard)
  public getTwitterAuthenticationStatus(@ParamBot() bot: Bot) {
    return this.twitterAuthService.getAuthenticationStatus(bot);
  }
}
