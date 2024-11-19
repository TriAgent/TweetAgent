import { ChatPromptTemplate } from "@langchain/core/prompts";
import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { langchain } from "src/services";
import { z } from "zod";
import { replyAggregatorStateAnnotation } from "./x-posts-handler.service";

export const produceAggregatedReplyAgent = (replyAnalysisResults: XPostReplyAnalysisResult[]) => {
  return async (state: typeof replyAggregatorStateAnnotation.State) => {
    const structuredOutput = z.object({
      fullTweet: z.string().describe("The full final tweet content"),
    });

    const SYSTEM_TEMPLATE = `
      We want to write a twitter post based on several content origins, but as a reply to a single user. 
      Write the X post.
      Do not mention the user in the post.
      ---------------- 
      [Partial replies to aggregate:]
      {partialReplies}
    `;

    // No actual user message, everything is in the system prompt.
    const prompt = ChatPromptTemplate.fromMessages<{ partialReplies: string[] }>([
      ["system", SYSTEM_TEMPLATE]
    ]);

    const { structuredResponse } = await langchain().fullyInvoke(
      // Initial command
      [
        ["system", SYSTEM_TEMPLATE]
      ],
      // Input values
      {
        partialReplies: replyAnalysisResults.map(rar => rar.reply).filter(r => !!r)
      },
      // Tools
      [],
      // Output format
      structuredOutput
    );

    state.fullTweet = structuredResponse.fullTweet;

    return state
  }
};