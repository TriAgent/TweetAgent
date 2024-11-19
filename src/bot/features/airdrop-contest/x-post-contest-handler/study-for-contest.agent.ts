import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";
import { z } from "zod";
import { contestHandlerStateAnnotation } from "./x-post-contest-handler.service";

/**
 * Determines if the post is worth being part of the airdrop contest or not, 
 * and if so, generates a reply for user to know we handled the post.
 */
export const studyForContestAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof contestHandlerStateAnnotation.State) => {
    const structuredOutput = z.object({
      isWorthForContest: z.boolean().describe("Whether the post is worth for the airdrop contest or not"),
    });

    const SYSTEM_TEMPLATE = `
      Here is a twitter post from a third party user who mentioned us. 
      Determine if this post is worth for our account to retweet as a good crypto news.

      Here is the tweet:
      ---------------- 
      {tweetContent}
    `;

    const prompt = ChatPromptTemplate.fromMessages<{ tweetContent: string }>([
      ["system", SYSTEM_TEMPLATE]
    ]);

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke(
      prompt,
      { tweetContent: post.text },
      [],
      structuredOutput
    );

    // TODO: change the reply to let user know he should not forget to send his airdrop address too, if not sent yet.

    state.isWorthForContest = structuredResponse.isWorthForContest;
    if (state.isWorthForContest)
      state.reply = `Good news, your post has joined the airdrop contest`;

    return state;
  }
};
