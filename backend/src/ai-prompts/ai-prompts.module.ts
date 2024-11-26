import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AiPromptsController } from './ai-prompts.controller';
import { AiPromptsService } from './ai-prompts.service';

@Module({
  controllers: [
    AiPromptsController
  ],
  providers: [
    AiPromptsService
  ],
  exports: [
    AiPromptsService
  ],
  imports: [
    PrismaModule
  ]
})
export class AiPromptsModule { }
