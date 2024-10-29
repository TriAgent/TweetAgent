import { StructuredTool } from "@langchain/core/tools";
import { END } from "@langchain/langgraph";
import { XPost } from "@prisma/client";
import { ReplierNode } from "../model/replier-node";
import { TweetTrait } from "../model/tweet-trait";
import { replierStateAnnotation } from "../x-replier.service";

/**
 * Based on tweet traits, decide to reply or not
 */
export const shouldReplyRouter = (tools: StructuredTool[], reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {

    const hasTrait = (trait: TweetTrait) => state.tweetTraits.includes(trait);

    // TODO: much more advanced decision tree
    if (hasTrait(TweetTrait.Question) || hasTrait(TweetTrait.Cheerful) || hasTrait(TweetTrait.Opinion))
      return ReplierNode.Reply;

    return END;
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