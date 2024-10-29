import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XPostsService } from './xposts.service';

@Module({
  providers: [
    XPostsService
  ],
  exports: [
    XPostsService
  ],
  imports: [
    PrismaModule,
    TwitterModule
  ]
})
export class XPostsModule { }
