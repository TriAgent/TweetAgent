import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DebugCommentController } from './debug-comment.controller';
import { DebugCommentService } from './debug-comment.service';

@Module({
  controllers: [
    DebugCommentController
  ],
  providers: [
    DebugCommentService
  ],
  exports: [
    DebugCommentService
  ],
  imports: [
    PrismaModule
  ]
})
export class DebugCommentModule { }
