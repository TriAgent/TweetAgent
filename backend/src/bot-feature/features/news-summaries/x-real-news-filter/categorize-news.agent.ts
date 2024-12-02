import { MessagesAnnotation } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { aiPromptsService, langchainService } from "src/services";
import { categorizeNewsTool } from "./categorize-news.tool";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";

export const categorizeNewsAgent = (feature: AnyBotFeature, logger: Logger, post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const { responseMessage } = await langchainService().fullyInvoke({
      messages: [["system", await aiPromptsService().get(feature.bot, "news-summaries/categorize-news")]],
      invocationParams: { tweetContent: post.text },
      tools: [
        categorizeNewsTool(logger, post) // ability to update a DB post with "isRealNews" info
      ]
    });
    return responseMessage;
  }
};