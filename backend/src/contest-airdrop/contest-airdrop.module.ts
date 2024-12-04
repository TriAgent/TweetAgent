import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContestAirdropController } from './contest-airdrop.controller';
import { ContestAirdropService } from './contest-airdrop.service';

@Module({
  controllers: [
    ContestAirdropController
  ],
  providers: [
    ContestAirdropService
  ],
  imports: [
    PrismaModule
  ]
})
export class ContestAirdropModule { }
