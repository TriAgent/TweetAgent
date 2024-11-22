import { Module } from '@nestjs/common';
import { AiPromptsService } from './ai-prompts.service';

@Module({
  providers: [
    AiPromptsService
  ],
  exports: [
    AiPromptsService
  ]
})
export class AiPromptsModule { }
