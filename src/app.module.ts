import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { BotModule } from './bot/bot.module';
import { CryptoNewsModule } from './crypto-news/crypto-news.module';
import { TwitterModule } from './twitter/twitter.module';
import { LangchainModule } from './langchain/langchain.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BootstrapModule,
    BotModule,
    TwitterModule,
    CryptoNewsModule,
    LangchainModule
  ],
  providers: [AppService],
})
export class AppModule { }
