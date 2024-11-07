import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OperationHistoryService } from './operation-history.service';

@Module({
  providers: [
    OperationHistoryService
  ],
  exports: [
    OperationHistoryService
  ],
  imports: [
    PrismaModule
  ]
})
export class OperationHistoryModule { }
