import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { AppLogger } from "src/logs/app-logger";
import { langchainService } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation, XPostsHandlerFeature } from "./x-posts-handler.feature";

export const produceAggregatedReplyAgent = (logger: AppLogger, feature: XPostsHandlerFeature, replyAnalysisResults: XPostReplyAnalysisResult[]) => {
  return async (state: typeof replyAggregatorStateAnnotation.State) => {

    const { structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", feature.config._prompts.produceAggregatedReply]
      ],
      invocationParams: {
        partialReplies: replyAnalysisResults.map(rar => rar.reply).filter(r => !!r)
      },
      structuredOutput: z.object({
        fullTweet: z.string().describe("The full final tweet content"),
      })
    });

    if (!structuredResponse) {
      logger.error(`Failed to get structured response when generating an aggregated reply!`);
      return state;
    }

    state.fullTweet = structuredResponse.fullTweet;

    return state
  }
};