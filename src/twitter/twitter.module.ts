import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterAuthService } from './twitter-auth.service';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';

@Module({
  controllers: [
    TwitterController
  ],
  providers: [
    TwitterAuthService,
    TwitterService
  ],
  exports: [
    TwitterAuthService,
    TwitterService
  ],
  imports: [
    PrismaModule
  ]
})
export class TwitterModule { }
