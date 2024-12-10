import { MessagesAnnotation } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { debugCommentService, langchainService } from "src/services";
import { z } from "zod";
import { categorizeNewsTool } from "./categorize-news.tool";
import { XRealNewsFilterFeature } from "./x-real-news-filter.feature";

export const categorizeNewsAgent = (feature: XRealNewsFilterFeature, logger: Logger, post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const { responseMessage, structuredResponse } = await langchainService().fullyInvoke({
      messages: [
        ["system", feature.config._prompts.categorizeNews]
      ],
      invocationParams: { tweetContent: post.text },
      tools: [
        categorizeNewsTool(logger, post) // ability to update a DB post with "isRealNews" info
      ],
      structuredOutput: z.object({
        reason: z.string().describe("The reason why you think the post is a real news or not")
      })
    });

    // Attach dismiss reason as comment
    if (structuredResponse?.reason)
      await debugCommentService().createPostComment(post, structuredResponse.reason, feature.dbFeature);

    return responseMessage;
  }
};