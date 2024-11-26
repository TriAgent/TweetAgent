import { Logger } from "@nestjs/common";
import { BotFeature } from "src/bots/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { aiPromptsService, langchainService } from "src/services";
import { z } from "zod";
import { contestReposterStateAnnotation } from "./x-post-contest-reposter.feature";

/**
 * Writes a post header for the quoted airdrop contest post
 */
export const writePostQuoteContentAgent = (feature: BotFeature, logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    if (!state.electedPost)
      return state;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", BotConfig.AirdropContest.Personality],
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", await aiPromptsService().get(feature.bot, "airdrop-contest/write-post-quote-content")]
      ],
      invocationParams: {
        post: state.electedPost.text
      },
      structuredOutput: z.object({
        reply: z.string().describe("The introductive quote message")
      })
    });

    state.reply = structuredResponse.reply;

    return state;
  }
};
