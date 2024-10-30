import { BaseMessageLike } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { botPersonalityPromptChunk, forbiddenWordsPromptChunk, tweetCharactersSizeLimitationPromptChunk } from "src/langchain/prompt-parts";
import { langchain, twitterAuth, xPosts } from "src/services";
import { z } from "zod";
import { TweetTrait } from "../model/tweet-trait";
import { replierStateAnnotation } from "../x-replier.service";

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
    const conversation = await xPosts().getConversation(reply.postId);
    if (!conversation)
      return state;

    const guidelineRules = {
      [TweetTrait.Pricing]: "Tell that we don't provide market price advice, using joyful tone. Be concise about this.",
      [TweetTrait.Question]: "Answer the question if you really know. If you don't, don't reply to the this part.",
      [TweetTrait.Cheerful]: "Be grateful to the positive message received if it was a compliment, or simply reply with positive vibes.",
      [TweetTrait.Opinion]: "Give your opinion about what the user stated. You can agree or disagree but be factual."
    }

    const replyGuidelines = state.tweetTraits
      .map(tt => guidelineRules[tt]) // Map from rules, if any defined. Can be undefined
      .filter(g => !!g) // Filter out undefined
      .map(g => `- ${g}`) // Add trailing dash
      .join("\n"); // Skip lines and make as string

    const REQUEST_TEMPLATE = `
      Below conversation is a twitter conversation. We have decided to write a reply for it. The parent tweet you are
      replying to has been analyzed and you should include only the following items in the answer.

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
      if (post.authorId === botAccount.userId)
        messages.push(["human", `[we wrote:] ${post.text}`])
      else
        messages.push(["human", `[twitter user ${post.authorId} wrote:] ${post.text}`])
    }

    // Action request
    messages.push(["system",
      `Write the tweet reply. You are mainly replying to the most recent 
       tweet above. Do not @ the user ID in the reply.`]);

    console.log("messages", messages)

    const prompt = ChatPromptTemplate.fromMessages(messages);

    logger.log("Generating tweet reply");
    const response = await prompt.pipe(model).invoke({});

    console.log("response", state)

    state.tweetReply = response?.tweetReply;

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