import { MessagesAnnotation } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";
import { categorizeNewsTool } from "./categorize-news.tool";

export const categorizeNewsAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const SYSTEM_TEMPLATE = `
      Here is a twitter post related to crypto. You have to evaluate if this post is a 
      real news that brings new information to users about the crypto landscape.
      ---------------- 
      {tweetContent}
    `;

    const { responseMessage } = await langchain().fullyInvoke(
      // Initial prompt message
      [
        ["system", SYSTEM_TEMPLATE]
      ],
      // Invocation params
      {
        tweetContent: post.text
      },
      // Tools
      [
        categorizeNewsTool(logger, post) // ability to update a DB post with "isRealNews" info
      ]
    );
    return responseMessage;
  }
};