import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { Bot } from '@prisma/client';
import { ParamBot } from 'src/bots/decorators/bot-decorator';
import { BotGuard } from 'src/bots/guards/bot-guard';
import { ContestAirdropService } from './contest-airdrop.service';

@Controller('bots')
export class ContestAirdropController {
  constructor(
    private contestAirdropService: ContestAirdropService
  ) { }

  // Recent airdrops only for now
  @Get(':botId/airdrops')
  @UseGuards(BotGuard)
  async getRecentAirdrops(@ParamBot() bot: Bot) {
    if (!bot)
      throw new HttpException(`Bot not found`, 404);

    return this.contestAirdropService.getRecentAirdropsWithTransactions(bot);
  }
}
