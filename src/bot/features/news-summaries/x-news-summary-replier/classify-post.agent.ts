import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { XPost } from "@prisma/client";
import { aiPrompts, langchain } from "src/services";
import { z } from "zod";
import { TweetTrait } from "./model/tweet-trait";
import { replierStateAnnotation } from "./x-news-summary-replier.service";

/**
 * Determines tweet traits and stores traits in the global state
 */
export const classifyPostAgent = (tools: StructuredTool[], reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {
    const traitSchema = z.object({
      traits: z
        .array(z.string())
        .describe("The list of traits that characterize the tweet according to the requirements"),
    });

    const model = langchain().getModel().withStructuredOutput(traitSchema, {
      name: "extract_tweet_traits",
      strict: true
    });

    // No actual user message, everything is in the system prompt.
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", aiPrompts().load("news-summaries/classify-post")]
    ]);

    const response = await prompt.pipe(model).invoke({ tweetContent: reply.text });

    state.tweetTraits.push(...response.traits.map(t => t as TweetTrait));

    return state;
  }
};
