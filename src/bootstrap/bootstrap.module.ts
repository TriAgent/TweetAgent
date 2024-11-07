import { Module } from '@nestjs/common';
import { BotModule } from 'src/bot/bot.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { BootstrapService } from './bootstrap.service';

@Module({
  providers: [
    BootstrapService
  ],
  imports: [
    TwitterModule,
    BotModule
  ],
  exports: [
    BootstrapService
  ]
})
export class BootstrapModule { }
