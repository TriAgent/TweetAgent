import { Module } from '@nestjs/common';
import { LangchainModule } from 'src/langchain/langchain.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { CryptoNewsService } from './crypto-news.service';
import { WebSearchNewsService } from './web-search/web-search.service';
import { XPostsNewsService } from './x-posts/x-posts.service';

@Module({
  providers: [
    CryptoNewsService,
    XPostsNewsService,
    WebSearchNewsService
  ],
  exports: [
    CryptoNewsService
  ],
  imports: [
    TwitterModule,
    PrismaModule,
    LangchainModule
  ]
})
export class CryptoNewsModule { }
