import { StructuredTool } from "@langchain/core/tools";
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

    const tools: StructuredTool[] = [];

    const structuredOutput = z.object({
      reply: z.string().describe("The introductive quote message")
    });

    const REQUEST_TEMPLATE = `
      Below is a third party user tweet that we are going to retweet/quote from our twitter account. Write a very short
      text that we will use as quote message, to introduce the given user post. You can also give your opinion about it.
      ---------------- 
      {post}
    `;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke(
      [
        ["system", forbiddenWordsPromptChunk()],
        ["system", tweetCharactersSizeLimitationPromptChunk()],
        ["system", REQUEST_TEMPLATE]
      ],
      {
        post: state.electedPost.text
      },
      tools,
      structuredOutput
    );

    state.reply = structuredResponse.reply;

    return state;
  }
};
