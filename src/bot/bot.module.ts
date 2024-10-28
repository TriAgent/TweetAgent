import { Module } from '@nestjs/common';
import { CryptoNewsModule } from 'src/crypto-news/crypto-news.module';
import { LangchainModule } from 'src/langchain/langchain.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { BotService } from './bot.service';
import { XReplierService } from './x-replier.service';
import { XSummaryWriterService } from './x-summary-writer.service';

@Module({
  providers: [
    BotService,
    XSummaryWriterService,
    XReplierService
  ],
  exports: [
    BotService
  ],
  imports: [
    PrismaModule,
    TwitterModule,
    CryptoNewsModule,
    LangchainModule
  ]
})
export class BotModule { }
