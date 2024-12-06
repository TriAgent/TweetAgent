import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { BotFeatureModule } from './bot-feature/bot-feature.module';
import { BotsModule } from './bots/bots.module';
import { ChainModule } from './chain/chain.module';
import { ContestAirdropModule } from './contest-airdrop/contest-airdrop.module';
import { LangchainModule } from './langchain/langchain.module';
import { LogsModule } from './logs/logs.module';
import { OperationHistoryModule } from './operation-history/operation-history.module';
import { TwitterModule } from './twitter/twitter.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { XaccountsModule } from './xaccounts/xaccounts.module';
import { XPostsModule } from './xposts/xposts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BootstrapModule,
    TwitterModule,
    LangchainModule,
    XPostsModule,
    OperationHistoryModule,
    XaccountsModule,
    BotsModule,
    LogsModule,
    WebsocketsModule,
    BotFeatureModule,
    ContestAirdropModule,
    ChainModule
  ]
})
export class AppModule { }
