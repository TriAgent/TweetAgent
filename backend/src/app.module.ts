import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiPromptsModule } from './ai-prompts/ai-prompts.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { BotsModule } from './bots/bots.module';
import { LangchainModule } from './langchain/langchain.module';
import { LogsModule } from './logs/logs.module';
import { OperationHistoryModule } from './operation-history/operation-history.module';
import { TwitterModule } from './twitter/twitter.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { XaccountsModule } from './xaccounts/xaccounts.module';
import { XPostsModule } from './xposts/xposts.module';
import { BotFeatureModule } from './bot-feature/bot-feature.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BootstrapModule,
    TwitterModule,
    LangchainModule,
    XPostsModule,
    OperationHistoryModule,
    XaccountsModule,
    AiPromptsModule,
    BotsModule,
    LogsModule,
    WebsocketsModule,
    BotFeatureModule
  ]
})
export class AppModule { }
