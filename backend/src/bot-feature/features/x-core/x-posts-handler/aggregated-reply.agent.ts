import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { AppLogger } from "src/logs/app-logger";
import { aiPromptsService, langchainService } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation } from "./x-posts-handler.feature";

export const produceAggregatedReplyAgent = (logger: AppLogger, feature: AnyBotFeature, replyAnalysisResults: XPostReplyAnalysisResult[]) => {
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

    if (!structuredResponse) {
      logger.error(`Failed to get structured response when generating an aggragating reply!`);
      return state;
    }

    state.fullTweet = structuredResponse.fullTweet;

    return state
  }
};