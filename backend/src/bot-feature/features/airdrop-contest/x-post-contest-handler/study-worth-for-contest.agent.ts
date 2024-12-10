import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { debugCommentService, langchainService, xPostsService } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { z } from "zod";
import { contestHandlerStateAnnotation, XPostContestHandlerFeature } from "./x-post-contest-handler.feature";

/**
 * Determines if the post is worth being part of the airdrop contest or not, 
 * and if so, generates a reply for user to know we handled the post.
 */
export const studyWorthForContestAgent = (feature: XPostContestHandlerFeature, logger: Logger, post: XPostWithAccount) => {
  return async (state: typeof contestHandlerStateAnnotation.State) => {
    let postEvaluatedForContest: XPost;
    if (post.quotedPostId) {
      // If the post is quoting another post, we consider this quoted post as the potential post for contest so
      // this is our target.
      logger.log(`Post evaluated for contest is the quoted one`);
      postEvaluatedForContest = await xPostsService().getXPostByTwitterPostId(feature.bot.dbBot, post.quotedPostId);
    }
    else {
      logger.log(`Post evaluated for contest is the root one from the conversation`);
      // Evaluate the conversation root (we already have all potential parent posts in DB, ensured by the fetcher feature )
      const conversation = await xPostsService().getParentConversation(feature.bot, post.postId);
      postEvaluatedForContest = conversation[0];
    }

    // Make sure the root has not been evaluated (worth) to true or false yet (should be null)
    if (postEvaluatedForContest.worthForAirdropContest !== null) {
      logger.warn(`Target post already evaluated for contest. Skipping`);
      return state;
    }

    // Make sure the root is not our own bot post
    if (postEvaluatedForContest.xAccountUserId === feature.bot.dbBot.twitterUserId)
      return state;

    const targetMentioningPost = post;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse, responseMessage } = await langchainService().fullyInvoke({
      messages: [["system", feature.config._prompts.studyForContest]],
      invocationParams: { tweetContent: postEvaluatedForContest.text },
      structuredOutput: z.object({
        isWorthForContest: z.boolean().describe("Whether the post is worth for the airdrop contest or not"),
        reason: z.string().describe("The reason why you think the post is worth for the airdrop contest or not")
      })
    });

    if (!structuredResponse) {
      logger.error(`Failed to get a structured response while evaluating post for airdrop contest`);
      logger.error(responseMessage);
      return state;
    }

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

      // Attach dismiss reason as comment
      if (structuredResponse.reason)
        await debugCommentService().createPostComment(post, structuredResponse.reason, feature.dbFeature);
    }

    // Save worth for contest info into post.
    await xPostsService().updatePost(postEvaluatedForContest.id, {
      worthForAirdropContest: state.isWorthForContest,
      contestMentioningPost: { connect: { id: targetMentioningPost.id } }
    });

    return state;
  }
};
