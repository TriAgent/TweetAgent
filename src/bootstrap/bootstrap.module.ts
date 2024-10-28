import { Module } from '@nestjs/common';
import { BotModule } from 'src/bot/bot.module';
import { CryptoNewsModule } from 'src/crypto-news/crypto-news.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { BootstrapService } from './bootstrap.service';

@Module({
  providers: [
    BootstrapService
  ],
  imports: [
    TwitterModule,
    BotModule,
    CryptoNewsModule
  ],
  exports: [
    BootstrapService
  ]
})
export class BootstrapModule { }
