import { Body, Controller, Get, HttpException, Post, Put, UseGuards } from '@nestjs/common';
import { Bot } from '@prisma/client';
import { AiPrompt as AiPromptDTO, Bot as BotDTO } from "@x-ai-wallet-bot/common";
import { AiPromptsService } from 'src/ai-prompts/ai-prompts.service';
import { ParamPrompt } from 'src/ai-prompts/decorators/prompt-decorator';
import { PromptGuard } from 'src/ai-prompts/guards/prompt-guard';
import { BotsService } from './bots.service';
import { ParamBot } from './decorators/bot-decorator';
import { BotGuard } from './guards/bot-guard';

@Controller('bots')
export class BotsController {
  constructor(
    private bots: BotsService,
    private aiPrompts: AiPromptsService
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
  async updatePrompt(@ParamBot() bot: Bot, @ParamPrompt() prompt, @Body() body: { prompt: AiPromptDTO, key: Exclude<keyof AiPromptDTO, "id>"> }) {
    if (!prompt)
      throw new HttpException(`Prompt not found`, 404);

    return this.bots.updatePrompt(bot, prompt, body.prompt, body.key);
  }

  @Get(':botId/features')
  @UseGuards(BotGuard)
  async listBotFeatures(@ParamBot() bot: Bot) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.bots.listBotFeatureConfigs(bot);
  }
}
