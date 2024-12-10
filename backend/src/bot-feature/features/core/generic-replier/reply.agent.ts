import { BaseMessageLike } from "@langchain/core/messages";
import { XPost } from "@prisma/client";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { AppLogger } from "src/logs/app-logger";
import { debugCommentService, langchainService, xPostsService } from "src/services";
import { z } from "zod";
import { GenericReplierFeature, replierStateAnnotation } from "./generic-replier.feature";
import { TweetTrait } from "./model/tweet-trait";

/**
 * Generate a reply based on tweet traits
 */
export const replyAgent = (feature: GenericReplierFeature, reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {
    const logger = new AppLogger("ReplyAgent", feature.bot);

    const outputSchema = z.object({
      tweetReply: z.string().describe("The tweet reply"),
    });

    const model = langchainService().getModel().withStructuredOutput(outputSchema);

    //const botAccount = await twitterAuthService().getAuthenticatedBotAccount();

    // Retrieve conversation
    // TODO: store in state for multiple agents to use it?
    const conversation = await xPostsService().getParentConversation(feature.bot, reply.postId);
    if (!conversation)
      return state;

    const guidelineRules = {
      [TweetTrait.Pricing]: feature.config._prompts.replyClassificationTraitPricing,
      [TweetTrait.Question]: feature.config._prompts.replyClassificationTraitQuestion,
      [TweetTrait.Cheerful]: feature.config._prompts.replyClassificationTraitCheerful,
      [TweetTrait.Opinion]: feature.config._prompts.replyClassificationTraitOpinion
    }

    const replyGuidelines = state.tweetTraits
      .map(tt => guidelineRules[tt]) // Map from rules, if any defined. Can be undefined
      .filter(g => !!g) // Filter out undefined
      .map(g => `- ${g}`) // Add trailing dash
      .join("\n"); // Skip lines and make as string

    const REQUEST_TEMPLATE = `
      ${feature.config._prompts.replyToNewsIntroduction}

      [Guidelines]
      ${replyGuidelines}
    `;

    // No actual user message, everything is in the system prompt.
    const messages: BaseMessageLike[] = [
      ["system", feature.bot.getRootFeature().config._prompts.personality],
      ["system", forbiddenWordsPromptChunk()],
      ["system", tweetCharactersSizeLimitationPromptChunk()],
      ["system", REQUEST_TEMPLATE]
    ];

    for (var post of conversation) {
      if (post.xAccountUserId === feature.bot.dbBot.twitterUserId)
        messages.push(["human", `[we wrote:] ${post.text}`])
      else
        messages.push(["human", `[twitter user ${post.xAccountUserId} wrote:] ${post.text}`])
    }

    // Action request
    messages.push(["system", feature.config._prompts.replyToNewsCommand]);

    logger.log("Generating tweet reply");
    const { structuredResponse } = await langchainService().fullyInvoke({
      messages,
      structuredOutput: z.object({
        reply: z.string().describe("The new tweet reply, if it was worth writing one. null otherwise"),
        reason: z.string().describe("Explain why you decided to produce a reply or not")
      })
    });

    console.log("structuredResponse", structuredResponse)

    state.tweetReply = structuredResponse?.reply;

    if (structuredResponse?.reason) {
      logger.log(`Generic reply reason:`);
      logger.log(structuredResponse?.reason);

      // Attach reply reason as comment
      await debugCommentService().createPostComment(post, structuredResponse?.reason, feature.dbFeature);
    }

    return state;
  }
};
