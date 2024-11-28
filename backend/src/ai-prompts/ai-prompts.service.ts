import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { Bot } from 'src/bots/model/bot';
import { BotConfig } from 'src/config/bot-config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiPromptsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Loads a prompt from the database.
   */
  public async get(bot: Bot, key: string): Promise<string> {
    if (!BotConfig.AiPrompts.RequiredTypes.includes(key))
      throw new Error(`Trying to get prompt with key "${key}" but the key has not been registered in the BotConfig. This would create unstable runtime. Please register it first`);

    const prompt = await this.prisma.aIPrompt.findUnique({
      where: {
        key_botId: {
          botId: bot.dbBot.id,
          key
        }
      }
    });

    if (!prompt)
      throw new Error(`Failed to find prompt with key "${key}" in database for bot id ${bot.dbBot.id}. Possible reasons: key is wrong, or bot has not been prepared for prompts through ensureBotRequiredPrompts().`);

    return prompt.text;
  }

  /**
   * Loads AI prompt text from the prompts folder.
   * 
   * @param path relative to the prompts folder, without extension. eg: "airdrop-contest/elect-best-post-for-contest"
   */
  private loadFromDisk(path: string): string {
    const fullPath = `${BotConfig.AiPrompts.Folder}/${path}.txt`;

    if (!existsSync(fullPath))
      throw new Error(`No AI prompt found with path "${path}" inside prompt folder ${BotConfig.AiPrompts.Folder}`);

    return readFileSync(fullPath, { encoding: "utf-8" }).toString();
  }

  /**
   * Ensures all required prompt types are created in database for the given bot
   */
  public async ensureBotRequiredPrompts(bot: Bot) {
    const requiredPrompts = BotConfig.AiPrompts.RequiredTypes;
    for (const promptType of requiredPrompts) {
      await this.prisma.aIPrompt.upsert({
        where: {
          key_botId: {
            botId: bot.dbBot.id,
            key: promptType
          }
        },
        create: {
          bot: { connect: { id: bot.dbBot.id } },
          key: promptType,
          text: await this.loadFromDisk(promptType)
        },
        update: {}
      })
    }
  }
}
