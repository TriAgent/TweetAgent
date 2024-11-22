import { BaseMessageLike } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { botPersonalityPromptChunk } from "src/bot/model/prompt-parts/news-summary";
import { forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { aiPrompts, langchain, twitterAuth, xPosts } from "src/services";
import { z } from "zod";
import { TweetTrait } from "./model/tweet-trait";
import { replierStateAnnotation } from "./x-news-summary-replier.service";

/**
 * Generate a reply based on tweet traits
 */
export const replyAgent = (tools: StructuredTool[], reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {
    const logger = new Logger("ReplyAgent");

    const outputSchema = z.object({
      tweetReply: z.string().describe("The tweet reply"),
    });

    const model = langchain().getModel().withStructuredOutput(outputSchema);

    const botAccount = await twitterAuth().getAuthenticatedBotAccount();

    // Retrieve conversation
    // TODO: store in state for multiple agents to use it?
    const conversation = await xPosts().getParentConversation(reply.postId);
    if (!conversation)
      return state;

    const guidelineRules = {
      [TweetTrait.Pricing]: aiPrompts().load("news-summaries/reply-to-news-reply-tweet-traits/pricing"),
      [TweetTrait.Question]: aiPrompts().load("news-summaries/reply-to-news-reply-tweet-traits/question"),
      [TweetTrait.Cheerful]: aiPrompts().load("news-summaries/reply-to-news-reply-tweet-traits/cheerful"),
      [TweetTrait.Opinion]: aiPrompts().load("news-summaries/reply-to-news-reply-tweet-traits/opinion")
    }

    const replyGuidelines = state.tweetTraits
      .map(tt => guidelineRules[tt]) // Map from rules, if any defined. Can be undefined
      .filter(g => !!g) // Filter out undefined
      .map(g => `- ${g}`) // Add trailing dash
      .join("\n"); // Skip lines and make as string

    const REQUEST_TEMPLATE = `
      ${aiPrompts().load("news-summaries/reply-to-news-reply")}

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
      if (post.xAccountUserId === botAccount.userId)
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
