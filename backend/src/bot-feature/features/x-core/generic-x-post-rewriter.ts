import { Bot } from "src/bots/model/bot";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { langchainService } from "src/services";

/**
 * Rewrites the given text (coming from a hardcoded text) according to bot's personnality.
 */
export const xPostAIRewrite = async (bot: Bot, originalPostText: string): Promise<string> => {
  const { stringResponse, responseMessage } = await langchainService().fullyInvoke({
    messages: [
      ["system", bot.getRootFeature().config._prompts.personality],
      ["system", forbiddenWordsPromptChunk()],
      ["system", tweetCharactersSizeLimitationPromptChunk()],
      ["user", `
        Rewrite the following twitter post content according to your own personnality:
        ------
        {post}
      `]
    ],
    invocationParams: {
      post: originalPostText
    }
  });

  console.log("originalPostText", originalPostText)
  console.log("responseMessage", responseMessage)
  console.log("stringResponse", stringResponse)

  return stringResponse;
}