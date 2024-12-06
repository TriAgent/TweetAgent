import { Logger } from "@nestjs/common";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { langchainService } from "src/services";
import { z } from "zod";
import { contestReposterStateAnnotation, XPostContestReposterFeature } from "./x-post-contest-reposter.feature";

/**
 * Writes a post header for the quoted airdrop contest post
 */
export const writePostQuoteContentAgent = (feature: XPostContestReposterFeature, logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    if (!state.electedPost)
      return state;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", feature.bot.getRootFeature().config._prompts.personality],
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", feature.config._prompts.writePostQuoteContent]
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
