import { Logger } from "@nestjs/common";
import { debugCommentService, langchainService } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { z } from "zod";
import { contestHandlerStateAnnotation, XPostContestHandlerFeature } from "./x-post-contest-handler.feature";

/**
 * Determines if the post requests us to evaluate a conversation post for the airdrop contest.
 */
export const studyContestRequestAgent = (feature: XPostContestHandlerFeature, logger: Logger, post: XPostWithAccount) => {
  return async (state: typeof contestHandlerStateAnnotation.State) => {
    // The current post should mention us (either root possibly for contest, 
    // or a mention reply on the potential contest post), otherwise dismiss
    if (!feature.bot.isMentionedInPostText(post.text))
      return state;

    const { structuredResponse, responseMessage } = await langchainService().fullyInvoke({
      messages: [["system", feature.config._prompts.studyContestRequest]],
      invocationParams: { tweetContent: post.text },
      structuredOutput: z.object({
        isContestRequest: z.boolean().describe("Whether the post is a request to join the airdrop contest or not"),
        reason: z.string().describe("The reason for your decision")
      })
    });

    if (!structuredResponse) {
      logger.error(`Failed to get a structured response while evaluating mentioning post for airdrop contest`);
      logger.error(responseMessage);
      return state;
    }

    state.isContestRequest = structuredResponse.isContestRequest;
    if (state.isContestRequest)
      logger.log(`Post is a request to submit a post for airdrop contest.`);
    else
      logger.log(`Post is NOT a request to submit a post for airdrop contest.`);

    logger.log(`Reason: ${structuredResponse?.reason}`);
    if (structuredResponse?.reason)
      await debugCommentService().createPostComment(post, structuredResponse.reason, feature.dbFeature);

    return state;
  }
};
