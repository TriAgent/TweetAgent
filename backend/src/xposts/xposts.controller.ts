import { Body, Controller, Get, HttpException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Bot } from '@prisma/client';
import { XPostCreationDTO } from '@x-ai-wallet-bot/common';
import { ParamBot } from 'src/bots/decorators/bot-decorator';
import { BotGuard } from 'src/bots/guards/bot-guard';
import { XPostsService } from './xposts.service';

@Controller('bots')
export class XPostsController {
  constructor(
    private readonly xPosts: XPostsService
  ) { }

  @Get(':botId/posts/:postId')
  @UseGuards(BotGuard)
  async getPost(@ParamBot() bot: Bot, @Param('postId') postId?: string) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    console.log("get post id ", postId)

    return this.xPosts.getXPostByTwitterPostId(bot, postId);
  }

  @Get(':botId/posts')
  @UseGuards(BotGuard)
  async listPosts(@ParamBot() bot: Bot, @Query('root') rootPostId?: string) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.xPosts.getChildrenPosts(bot, rootPostId);
  }

  @Post(':botId/posts')
  @UseGuards(BotGuard)
  async createPost(@ParamBot() bot: Bot, @Body() postCreationInput: XPostCreationDTO) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.xPosts.createManualPost(bot, postCreationInput);
  }
}