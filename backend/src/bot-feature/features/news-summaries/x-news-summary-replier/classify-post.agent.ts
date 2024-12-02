import { ChatPromptTemplate } from "@langchain/core/prompts";
import { XPost } from "@prisma/client";
import { aiPromptsService, langchainService } from "src/services";
import { z } from "zod";
import { TweetTrait } from "./model/tweet-trait";
import { replierStateAnnotation } from "./x-news-summary-replier.feature";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";

/**
 * Determines tweet traits and stores traits in the global state
 */
export const classifyPostAgent = (feature: AnyBotFeature, reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {
    const traitSchema = z.object({
      traits: z
        .array(z.string())
        .describe("The list of traits that characterize the tweet according to the requirements"),
    });

    const model = langchainService().getModel().withStructuredOutput(traitSchema, {
      name: "extract_tweet_traits",
      strict: true
    });

    // No actual user message, everything is in the system prompt.
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", await aiPromptsService().get(feature.bot, "news-summaries/classify-post")]
    ]);

    const response = await prompt.pipe(model).invoke({ tweetContent: reply.text });

    state.tweetTraits.push(...response.traits.map(t => t as TweetTrait));

    return state;
  }
};
