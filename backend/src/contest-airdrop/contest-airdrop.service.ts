import { Injectable } from '@nestjs/common';
import { Bot as DBBot } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContestAirdropService {
  constructor(private prisma: PrismaService) { }

  public async getRecentAirdropsWithTransactions(bot: DBBot) {
    const airdrops = await this.prisma.contestAirdrop.findMany({
      where: {},
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        postAirdrops: {
          include: {
            quotePost: {
              include: { xAccount: true }
            },
            winningXAccount: true
          }
        }
      }
    });

    return airdrops;
  }
}
