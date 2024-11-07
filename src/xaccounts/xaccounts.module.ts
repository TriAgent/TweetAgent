import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XAccountsService } from './xaccounts.service';

@Module({
  providers: [
    XAccountsService
  ],
  exports: [
    XAccountsService
  ],
  imports: [
    PrismaModule,
    TwitterModule
  ]
})
export class XaccountsModule { }
