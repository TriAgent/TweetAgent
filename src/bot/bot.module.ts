import { Module } from '@nestjs/common';
import { CryptoNewsModule } from 'src/crypto-news/crypto-news.module';
import { LangchainModule } from 'src/langchain/langchain.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XPostsModule } from 'src/xposts/xposts.module';
import { BotService } from './bot.service';
import { XReplierService } from './x-replier/x-replier.service';
import { XSummaryWriterService } from './x-summary-writer/x-summary-writer.service';

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
    LangchainModule,
    XPostsModule
  ]
})
export class BotModule { }
