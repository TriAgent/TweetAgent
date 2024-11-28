import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwitterModule } from 'src/twitter/twitter.module';
import { XAccountsController } from './xaccounts.controller';
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
  ],
  controllers: [
    XAccountsController
  ]
})
export class XaccountsModule { }
