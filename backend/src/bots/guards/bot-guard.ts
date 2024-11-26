import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BotGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const botId = request.params.botId;

    if (!botId)
      throw new NotFoundException('Bot ID not provided');

    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });

    if (!bot)
      throw new NotFoundException('Bot not found');

    request.bot = bot;

    return true;
  }
}
