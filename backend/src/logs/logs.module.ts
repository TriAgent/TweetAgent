import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  providers: [
    LogsService
  ],
  exports: [
    LogsService
  ],
  imports: [
    PrismaModule
  ],
  controllers: [
    LogsController
  ]
})
export class LogsModule { }
