import { BaseMessageLike } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { XPost } from "@prisma/client";
import { AnyBotFeature } from "src/bot-feature/model/bot-feature";
import { botPersonalityPromptChunk } from "src/bots/model/prompt-parts/news-summary";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { AppLogger } from "src/logs/app-logger";
import { aiPromptsService, langchainService, xPostsService } from "src/services";
import { z } from "zod";
import { replierStateAnnotation } from "./generic-replier.feature";
import { TweetTrait } from "./model/tweet-trait";

/**
 * Generate a reply based on tweet traits
 */
export const replyAgent = (feature: AnyBotFeature, reply: XPost) => {
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
      [TweetTrait.Pricing]: await aiPromptsService().get(feature.bot, "news-summaries/reply-to-news-reply-tweet-traits/pricing"),
      [TweetTrait.Question]: await aiPromptsService().get(feature.bot, "news-summaries/reply-to-news-reply-tweet-traits/question"),
      [TweetTrait.Cheerful]: await aiPromptsService().get(feature.bot, "news-summaries/reply-to-news-reply-tweet-traits/cheerful"),
      [TweetTrait.Opinion]: await aiPromptsService().get(feature.bot, "news-summaries/reply-to-news-reply-tweet-traits/opinion")
    }

    const replyGuidelines = state.tweetTraits
      .map(tt => guidelineRules[tt]) // Map from rules, if any defined. Can be undefined
      .filter(g => !!g) // Filter out undefined
      .map(g => `- ${g}`) // Add trailing dash
      .join("\n"); // Skip lines and make as string

    const REQUEST_TEMPLATE = `
      ${await aiPromptsService().get(feature.bot, "news-summaries/reply-to-news-reply")}

      [Guidelines]
      ${replyGuidelines}
    `;

    // No actual user message, everything is in the system prompt.
    const messages: BaseMessageLike[] = [
      ["system", botPersonalityPromptChunk()],
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
    messages.push(["system",
      `Write the tweet reply. You are mainly replying to the most recent 
       tweet above. Do not @ the user ID in the reply.`]);

    //console.log("messages", messages)

    const prompt = ChatPromptTemplate.fromMessages(messages);

    logger.log("Generating tweet reply");
    const response = await prompt.pipe(model).invoke({});

    console.log("response", state)

    state.tweetReply = response?.tweetReply;

    return state;
  }
};
