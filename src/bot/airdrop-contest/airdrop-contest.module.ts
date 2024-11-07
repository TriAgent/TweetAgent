import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/langchain/langchain.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XPostsModule } from 'src/xposts/xposts.module';
import { MentionRetrieverService } from '../features/mention-retriever/mention-retriever.service';
import { AirdropContestService } from './airdrop-contest.service';

@Module({
  providers: [
    AirdropContestService,
    MentionRetrieverService
  ],
  exports: [
    AirdropContestService,
    MentionRetrieverService
  ],
  imports: [
    PrismaModule,
    TwitterModule,
    LangchainModule,
    XPostsModule
  ]
})
export class AirdropContestModule { }
