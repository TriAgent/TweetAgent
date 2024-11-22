import { Logger } from "@nestjs/common";
import { BotConfig } from "src/config/bot-config";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { aiPrompts, langchain } from "src/services";
import { z } from "zod";
import { contestReposterStateAnnotation } from "./x-post-contest-reposter.service";

/**
 * Writes a post header for the quoted airdrop contest post
 */
export const writePostQuoteContentAgent = (logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    if (!state.electedPost)
      return state;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke({
      messages: [
        ["system", BotConfig.AirdropContest.Personality],
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", aiPrompts().load("airdrop-contest/write-post-quote-content")]
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
