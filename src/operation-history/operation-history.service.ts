import { Injectable } from '@nestjs/common';
import { OperationHistoryType } from '@prisma/client';
import moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OperationHistoryService {
  constructor(private prisma: PrismaService) { }

  public async mostRecentOperationDate(operationType: OperationHistoryType, defaultMinutesAgo: number): Promise<Date> {
    const mostRecentFetch = await this.prisma.operationHistory.findFirst({
      where: { type: operationType },
      orderBy: { createdAt: "desc" }
    });

    if (!mostRecentFetch) {
      // No entry yet? Fetch only since a few hours ago to save data
      return moment().subtract(defaultMinutesAgo, "minutes").toDate();
    }

    return mostRecentFetch.createdAt;
  }

  public saveRecentOperation(type: OperationHistoryType) {
    return this.prisma.operationHistory.create({ data: { type } });
  }
}
