import { Controller, Get } from '@nestjs/common';
import { BotFeatureProvider } from '@x-ai-wallet-bot/common';
import zodToJsonSchema from 'zod-to-json-schema';
import { BotFeatureService } from './bot-feature.service';

@Controller('bot-features')
export class BotFeatureController {
  constructor(
    private botFeatureService: BotFeatureService
  ) { }

  @Get('providers')
  public async getBotFeatureProviders(): Promise<BotFeatureProvider<any>[]> {
    const providers = await this.botFeatureService.getFeatureProviders();
    return providers.map(fp => ({
      type: fp.type,
      description: fp.description,
      configFormat: zodToJsonSchema(fp.configFormat)
    }));
  }
}
