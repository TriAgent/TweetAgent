import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const botId = request.params.botId;
    const featureId = request.params.featureId;
    if (!botId || !featureId)
      throw new NotFoundException('Bot or feature ID not provided');

    const feature = await this.prisma.botFeatureConfig.findFirst({
      where: {
        id: featureId,
        botId: botId
      }
    });

    if (!feature)
      throw new NotFoundException('Prompt not found');

    request.feature = feature;

    return true;
  }
}
