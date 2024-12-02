import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { aiPromptsService, langchainService } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation } from "./x-posts-handler.feature";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";

export const produceAggregatedReplyAgent = (feature: AnyBotFeature, replyAnalysisResults: XPostReplyAnalysisResult[]) => {
  return async (state: typeof replyAggregatorStateAnnotation.State) => {
    const { structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", await aiPromptsService().get(feature.bot, "core/produce-aggregated-reply")]
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