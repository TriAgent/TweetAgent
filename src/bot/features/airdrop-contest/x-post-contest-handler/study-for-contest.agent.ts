import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchain, twitterAuth, xPosts } from "src/services";
import { z } from "zod";
import { contestHandlerStateAnnotation } from "./x-post-contest-handler.service";

/**
 * Determines if the post is worth being part of the airdrop contest or not, 
 * and if so, generates a reply for user to know we handled the post.
 */
export const studyForContestAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof contestHandlerStateAnnotation.State) => {
    // Check if any child tweet mentions us.
    const conversationTree = await xPosts().getConversationTree(post);

    const botAccount = await twitterAuth().getAuthenticatedBotAccount();

    // Check if there are posts that mention us in the conversation tree.
    const mentioningPosts = conversationTree.searchPosts(`@${botAccount.userScreenName}`);

    // We are not mentioned, give up on this post.
    if (mentioningPosts.length === 0)
      return state;

    console.log("YEP WE ARE MENTIONED in conv of", post);

    const SYSTEM_TEMPLATE = `
      Here is a twitter post from a third party user who mentioned us. 
      Determine if this post is worth for our account to retweet as a good crypto news.

      Here is the tweet:
      ---------------- 
      {tweetContent}
    `;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke({
      messages: [["system", SYSTEM_TEMPLATE]],
      invocationParams: { tweetContent: post.text },
      structuredOutput: z.object({
        isWorthForContest: z.boolean().describe("Whether the post is worth for the airdrop contest or not"),
        reason: z.string().describe("The reason why you think the post is worth for the airdrop contest or not")
      })
    });

    // TODO: change the reply to let user know he should not forget to send his airdrop address too, if not sent yet.

    state.isWorthForContest = structuredResponse.isWorthForContest;
    if (state.isWorthForContest) {
      logger.log(`Post is eligible for airdrop contest:`);
      logger.log(post);
      logger.log(`Reason: ${structuredResponse.reason}`);

      state.reply = `Good news, your post has joined the airdrop contest`;
    }
    else {
      logger.log(`Post is NOT eligible for airdrop contest:`);
      logger.log(`Reason: ${structuredResponse.reason}`);
    }

    return state;
  }
};
