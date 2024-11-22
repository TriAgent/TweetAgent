import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { aiPrompts, langchain } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation } from "./x-posts-handler.service";

export const produceAggregatedReplyAgent = (replyAnalysisResults: XPostReplyAnalysisResult[]) => {
  return async (state: typeof replyAggregatorStateAnnotation.State) => {
    const { structuredResponse } = await langchain().fullyInvoke({
      messages: [
        ["system", aiPrompts().load("core/produce-aggregated-reply")]
      ],
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