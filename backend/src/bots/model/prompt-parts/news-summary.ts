import { BotConfig } from "src/config/bot-config";

/**
 * Tells the bot what kind of writing style and personality it should use while producing content.
 */
export const botPersonalityPromptChunk = () => {
  return BotConfig.NewsSummaryBot.Generation.Personality;
}