import { forwardRef, Module } from '@nestjs/common';
import { BotsModule } from 'src/bots/bots.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XaccountsModule } from 'src/xaccounts/xaccounts.module';
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
    TwitterModule,
    XaccountsModule,
    forwardRef(() => BotsModule)
  ]
})
export class XPostsModule { }
