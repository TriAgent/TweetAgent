import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogsService {
  private logger = new AppLogger("Logs");

  constructor(private prisma: PrismaService) { }

  public getLatestLogs() {
    return this.prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000
    });
  }
}
