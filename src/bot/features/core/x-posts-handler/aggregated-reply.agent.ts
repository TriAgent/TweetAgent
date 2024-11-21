import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { langchain } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation } from "./x-posts-handler.service";

export const produceAggregatedReplyAgent = (replyAnalysisResults: XPostReplyAnalysisResult[]) => {
  return async (state: typeof replyAggregatorStateAnnotation.State) => {
    const SYSTEM_TEMPLATE = `
      We want to write a twitter post based on several content origins, but as a reply to a single user. 
      Write the X post.
      Do not mention the user in the post. 
      Keep professional tone, do not show too much excitement or marketing-oriented attitude.
      ---------------- 
      [Partial replies to aggregate:]
      {partialReplies}
    `;

    const { structuredResponse } = await langchain().fullyInvoke({
      messages: [["system", SYSTEM_TEMPLATE]],
      invocationParams: {
        partialReplies: replyAnalysisResults.map(rar => rar.reply).filter(r => !!r)
      },
      structuredOutput: z.object({
        fullTweet: z.string().describe("The full final tweet content"),
      })
    });

    state.fullTweet = structuredResponse.fullTweet;

    return state
  }
};