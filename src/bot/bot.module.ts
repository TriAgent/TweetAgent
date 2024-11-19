import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/langchain/langchain.module';
import { OperationHistoryModule } from 'src/operation-history/operation-history.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XaccountsModule } from 'src/xaccounts/xaccounts.module';
import { XPostsModule } from 'src/xposts/xposts.module';
import { BotService } from './bot.service';
import { BotFeaturesService } from './features.service';
import { XPostAirdropAddressService } from './features/airdrop-contest/x-post-airdrop-address/x-post-airdrop-address.service';
import { XPostContestHandlerService } from './features/airdrop-contest/x-post-contest-handler/x-post-contest-handler.service';
import { XPostContestReposterService } from './features/airdrop-contest/x-post-contest-reposter/x-post-contest-reposter.service';
import { XPostFetcherService } from './features/core/x-posts-fetcher/x-post-fetcher.service';
import { XPostsHandlerService } from './features/core/x-posts-handler/x-posts-handler.service';
import { XPostSenderService } from './features/core/x-posts-sender/x-post-sender.service';
import { XNewsSummaryReplierService } from './features/news-summaries/x-news-summary-replier/x-news-summary-replier.service';
import { XNewsSummaryWriterService } from './features/news-summaries/x-news-summary-writer/x-summary-writer.service';
import { XRealNewsFilterService } from './features/news-summaries/x-real-news-filter/x-real-news-filter.service';

@Module({
  providers: [
    BotService,
    BotFeaturesService,

    // Features
    XPostFetcherService,
    XPostSenderService,
    XPostsHandlerService,
    XNewsSummaryWriterService,
    XNewsSummaryReplierService,
    XRealNewsFilterService,
    XPostContestHandlerService,
    XPostContestReposterService,
    XPostAirdropAddressService
  ],
  exports: [
    BotService
  ],
  imports: [
    OperationHistoryModule,
    XPostsModule,
    XaccountsModule,
    TwitterModule,
    PrismaModule,
    LangchainModule
  ]
})
export class BotModule { }
