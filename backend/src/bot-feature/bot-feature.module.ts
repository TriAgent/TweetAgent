import { Module } from '@nestjs/common';
import { DebugCommentModule } from 'src/debug-comment/debug-comment.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BotFeatureController } from './bot-feature.controller';
import { BotFeatureService } from './bot-feature.service';

@Module({
  controllers: [
    BotFeatureController
  ],
  providers: [
    BotFeatureService
  ],
  imports: [
    PrismaModule,
    DebugCommentModule
  ]
})
export class BotFeatureModule { }
