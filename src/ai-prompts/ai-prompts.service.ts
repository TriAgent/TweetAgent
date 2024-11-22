import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { BotConfig } from 'src/config/bot-config';

@Injectable()
export class AiPromptsService {
  /**
   * Loads AI prompt text from the prompts folder.
   * 
   * @param path relative to the prompts folder, without extension. eg: "airdrop-contest/elect-best-post-for-contest"
   */
  public load(path: string): string {
    const fullPath = `${BotConfig.AiPromptsFolder}/${path}.txt`;

    if (!existsSync(fullPath))
      throw new Error(`No AI prompt found with path "${path}" inside prompt folder ${BotConfig.AiPromptsFolder}`);

    return readFileSync(fullPath, { encoding: "utf-8" }).toString();
  }
}
