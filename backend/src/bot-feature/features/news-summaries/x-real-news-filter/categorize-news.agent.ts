import { MessagesAnnotation } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchainService } from "src/services";
import { categorizeNewsTool } from "./categorize-news.tool";
import { XRealNewsFilterFeature } from "./x-real-news-filter.feature";

export const categorizeNewsAgent = (feature: XRealNewsFilterFeature, logger: Logger, post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const { responseMessage } = await langchainService().fullyInvoke({
      messages: [["system", feature.config._prompts.categorizeNews]],
      invocationParams: { tweetContent: post.text },
      tools: [
        categorizeNewsTool(logger, post) // ability to update a DB post with "isRealNews" info
      ]
    });
    return responseMessage;
  }
};