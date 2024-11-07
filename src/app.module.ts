import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { AirdropContestModule } from './bot/airdrop-contest/airdrop-contest.module';
import { LangchainModule } from './langchain/langchain.module';
import { OperationHistoryModule } from './operation-history/operation-history.module';
import { TwitterModule } from './twitter/twitter.module';
import { XaccountsModule } from './xaccounts/xaccounts.module';
import { XPostsModule } from './xposts/xposts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BootstrapModule,
    AirdropContestModule,
    TwitterModule,
    LangchainModule,
    XPostsModule,
    OperationHistoryModule,
    XaccountsModule
  ]
})
export class AppModule { }
