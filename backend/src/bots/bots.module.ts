import { Module } from '@nestjs/common';
import { AiPromptsModule } from 'src/ai-prompts/ai-prompts.module';
import { LangchainModule } from 'src/langchain/langchain.module';
import { OperationHistoryModule } from 'src/operation-history/operation-history.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { XaccountsModule } from 'src/xaccounts/xaccounts.module';
import { XPostsModule } from 'src/xposts/xposts.module';
import { BotFeaturesService } from './bot-features.service';
import { BotsRunnerService } from './bot-runner.service';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';

@Module({
  controllers: [
    BotsController
  ],
  providers: [
    BotsRunnerService,
    BotsService,
    BotFeaturesService,
  ],
  imports: [
    PrismaModule,
    AiPromptsModule,
    OperationHistoryModule,
    XPostsModule,
    XaccountsModule,
    TwitterModule,
    LangchainModule,
    WebsocketsModule
  ],
  exports: [
    BotsService
  ]
})
export class BotsModule { }
