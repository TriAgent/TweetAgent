import { MessagesAnnotation } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { aiPrompts, langchain } from "src/services";
import { categorizeNewsTool } from "./categorize-news.tool";

export const categorizeNewsAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const { responseMessage } = await langchain().fullyInvoke({
      messages: [["system", aiPrompts().load("news-summaries/categorize-news")]],
      invocationParams: { tweetContent: post.text },
      tools: [
        categorizeNewsTool(logger, post) // ability to update a DB post with "isRealNews" info
      ]
    });
    return responseMessage;
  }
};