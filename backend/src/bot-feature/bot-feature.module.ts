import { Module } from '@nestjs/common';
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
    PrismaModule
  ]
})
export class BotFeatureModule { }
