import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";
import { z } from "zod";
import { TweetTrait } from "../model/tweet-trait";
import { replierStateAnnotation } from "../x-replier.service";

/**
 * Determines tweet traits and stores traits in the global state
 */
export const classifyReplyAgent = (tools: StructuredTool[], reply: XPost) => {
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

    const SYSTEM_TEMPLATE = `
    Here is a twitter post related to crypto. Provide a json array output that contains its traits:
    - if the content contains a question: "question".
    - if the content contains an opinion: "opinion".
    - if the content contains harsh, insulting, offensive: "offensive".
    - if the content contains a praise: "cheerful".
    - if the content contains market price or investment talk: "pricing".

    Here is the tweet:
    ---------------- 
    {tweetContent}`;

    // No actual user message, everything is in the system prompt.
    const prompt = ChatPromptTemplate.fromMessages([["system", SYSTEM_TEMPLATE]]);

    const response = await prompt.pipe(model).invoke({ tweetContent: reply.text });

    state.tweetTraits.push(...response.traits.map(t => t as TweetTrait));

    return state;
  }
};

/* 

TRAIT CREATOR

const traitSchema = z.object({
      traits: z
        .array(z.string())
        .describe("A list of traits contained in the input"),
    });

    const model = langchain().getModel().withStructuredOutput(traitSchema, {
      name: "extract_traits",
      strict: true
    });

    const SYSTEM_TEMPLATE = `
    Here is a twitter post related to crypto. You have to evaluate if this post is a 
    real news that brings new information to users about the crypto landscape.
    ---------------- 
    {tweetContent}`;

*/