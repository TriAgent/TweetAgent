import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { BotModule } from './bot/bot.module';
import { CryptoNewsModule } from './crypto-news/crypto-news.module';
import { LangchainModule } from './langchain/langchain.module';
import { TwitterModule } from './twitter/twitter.module';
import { XPostsModule } from './xposts/xposts.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BootstrapModule,
    BotModule,
    TwitterModule,
    CryptoNewsModule,
    LangchainModule,
    XPostsModule
  ]
})
export class AppModule { }
