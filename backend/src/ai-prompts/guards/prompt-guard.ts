import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PromptGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const botId = request.params.botId;
    const promptId = request.params.promptId;
    if (!botId || !promptId)
      throw new NotFoundException('Bot or prompt ID not provided');

    const aiPrompt = await this.prisma.aIPrompt.findFirst({
      where: {
        id: promptId,
        botId: botId
      }
    });

    if (!aiPrompt)
      throw new NotFoundException('Prompt not found');

    request.aiPrompt = aiPrompt;

    return true;
  }
}
