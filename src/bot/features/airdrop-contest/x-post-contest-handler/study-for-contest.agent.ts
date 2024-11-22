import { Logger } from "@nestjs/common";
import { langchain, prisma, twitterAuth, xPosts } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { z } from "zod";
import { contestHandlerStateAnnotation } from "./x-post-contest-handler.service";

/**
 * Determines if the post is worth being part of the airdrop contest or not, 
 * and if so, generates a reply for user to know we handled the post.
 */
export const studyForContestAgent = (logger: Logger, post: XPostWithAccount) => {
  return async (state: typeof contestHandlerStateAnnotation.State) => {
    const botAccount = await twitterAuth().getAuthenticatedBotAccount();

    // The current post should mention us (either root possibly for contest, 
    // or a mention reply on the potential contest post), otherwise dismiss
    if (post.text.indexOf(`@${botAccount.userScreenName}`) < 0)
      return state;

    // Evaluate the conversation root (we already have all potential parent posts in DB, ensured by the fetcher feature )
    const conversation = await xPosts().getParentConversation(post.postId);
    const postEvaluatedForContest = conversation[0];

    // Make sure the root has not been evaluated (worth) to true or false yet (should be null)
    if (postEvaluatedForContest.worthForAirdropContest !== null)
      return state;

    // Make sure the root is not our own bot post
    if (postEvaluatedForContest.xAccountUserId === botAccount.userId)
      return state;

    // Check if any child tweet mentions us.
    // const conversationTree = await xPosts().getConversationTree(post);
    // const mentioningPosts = conversationTree.searchPosts(`@${botAccount.userScreenName}`);

    // // We are not mentioned, give up on this post, don't update the worth for contest field in post.
    // if (mentioningPosts.length === 0) {
    //   logger.log(`Post conversation is not mentioning us. Not electing for contest.`);
    //   return state;
    // }

    // // Make sure to sort mentioning posts by oldest first, so we only consider the first mention as the right one, not late users.
    // mentioningPosts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    // const targetMentioningPost = mentioningPosts[0];
    const targetMentioningPost = post;

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
      invocationParams: { tweetContent: postEvaluatedForContest.text },
      structuredOutput: z.object({
        isWorthForContest: z.boolean().describe("Whether the post is worth for the airdrop contest or not"),
        reason: z.string().describe("The reason why you think the post is worth for the airdrop contest or not")
      })
    });

    // TODO: change the reply to let user know he should not forget to send his airdrop address too, if not sent yet.

    state.isWorthForContest = structuredResponse.isWorthForContest;
    if (state.isWorthForContest) {
      logger.log(`Post is eligible for airdrop contest:`);
      logger.log(postEvaluatedForContest);
      logger.log(`Reason: ${structuredResponse.reason}`);

      state.reply = `Good news, the post has joined the airdrop contest`;

      // If user hasn't configured an airdrop address yet, ask him to do so at the same time.
      if (!targetMentioningPost.xAccount.airdropAddress)
        state.reply += `Don't forget to give us a wallet address for your airdrop. To do so, simply reply to this post with your address, asking us to update it.`;
    }
    else {
      logger.log(`Post is NOT eligible for airdrop contest:`);
      logger.log(`Reason: ${structuredResponse.reason}`);
    }

    // Save worth for contest info into post.
    await prisma().xPost.update({
      where: { id: postEvaluatedForContest.id },
      data: {
        worthForAirdropContest: state.isWorthForContest,
        contestMentioningPost: { connect: { id: targetMentioningPost.id } }
      }
    });

    return state;
  }
};
