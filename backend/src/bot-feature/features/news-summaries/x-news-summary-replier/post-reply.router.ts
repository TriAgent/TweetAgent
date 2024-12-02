import { StructuredTool } from "@langchain/core/tools";
import { END } from "@langchain/langgraph";
import { XPost } from "@prisma/client";
import { ReplierNode } from "./model/replier-node";
import { TweetTrait } from "./model/tweet-trait";
import { replierStateAnnotation } from "./x-news-summary-replier.feature";

/**
 * Based on tweet traits, decide to reply or not
 */
export const postReplyRouter = (tools: StructuredTool[], reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {

    const hasTrait = (trait: TweetTrait) => state.tweetTraits.includes(trait);

    // TODO: much more advanced decision tree
    if (hasTrait(TweetTrait.Question) || hasTrait(TweetTrait.Cheerful) || hasTrait(TweetTrait.Opinion))
      return ReplierNode.Reply;

    return END;
  }
};
