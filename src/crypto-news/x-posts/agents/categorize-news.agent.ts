import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { MessagesAnnotation } from "@langchain/langgraph";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";

export const categorizeNewsAgent = (tools: StructuredTool[], post: XPost) => {
  return async (state: typeof MessagesAnnotation.State) => {
    const model = langchain().getModel().bindTools(tools);

    const SYSTEM_TEMPLATE = `
    Here is a twitter post related to crypto. You have to evaluate if this post is a 
    real news that brings new information to users about the crypto landscape.
    ---------------- 
    {tweetContent}`;

    // No actual user message, everything is in the system prompt.
    const prompt = ChatPromptTemplate.fromMessages([["system", SYSTEM_TEMPLATE]]);

    const response = await prompt.pipe(model).invoke({ tweetContent: post.text });
    return { messages: [response] };
  }
};