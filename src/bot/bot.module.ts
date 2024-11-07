import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/langchain/langchain.module';
import { OperationHistoryModule } from 'src/operation-history/operation-history.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XPostsModule } from 'src/xposts/xposts.module';
import { BotService } from './bot.service';
import { BotFeaturesService } from './features.service';
import { XPostFetcherService } from './features/x-posts-fetcher/x-post-fetcher.service';
import { XPostsReplierService } from './features/x-posts-replier/x-posts-replier.service';
import { XPostSenderService } from './features/x-posts-sender/x-post-sender.service';

@Module({
  providers: [
    BotService,
    BotFeaturesService,

    // Features
    XPostFetcherService,
    XPostSenderService,
    XPostsReplierService
  ],
  exports: [
    BotService
  ],
  imports: [
    OperationHistoryModule,
    XPostsModule,
    TwitterModule,
    PrismaModule,
    LangchainModule
  ]
})
export class BotModule { }
