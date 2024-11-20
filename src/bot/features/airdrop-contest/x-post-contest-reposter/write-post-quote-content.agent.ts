import { Logger } from "@nestjs/common";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { langchain } from "src/services";
import { z } from "zod";
import { contestReposterStateAnnotation } from "./x-post-contest-reposter.service";

/**
 * Writes a post header for the quoted airdrop contest post
 */
export const writePostQuoteContentAgent = (logger: Logger) => {
  return async (state: typeof contestReposterStateAnnotation.State) => {
    if (!state.electedPost)
      return state;

    const REQUEST_TEMPLATE = `
      Below is a third party user tweet that we are going to retweet/quote from our twitter account. Write a very short
      text that we will use as quote message, to introduce the given user post. You can also give your opinion about it.
      ---------------- 
      {post}
    `;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke({
      messages: [
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", REQUEST_TEMPLATE]
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
