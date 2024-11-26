import { Controller, Get } from '@nestjs/common';
import { BotConfig } from 'src/config/bot-config';
import { AiPromptsService } from './ai-prompts.service';

@Controller('ai-prompts')
export class AiPromptsController {
  constructor(
    private readonly aiPrompts: AiPromptsService
  ) { }

  @Get('required')
  listRequiredPromptTypes() {
    return BotConfig.AiPrompts.RequiredTypes;
  }
}
