import { BaseMessageLike } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { XPost } from "@prisma/client";
import { langchain, twitterAuth, xPosts } from "src/services";
import { z } from "zod";
import { TweetTrait } from "../model/tweet-trait";
import { replierStateAnnotation } from "../x-replier.service";

/**
 * Generate a reply based on tweet traits
 */
export const replyAgent = (tools: StructuredTool[], reply: XPost) => {
  return async (state: typeof replierStateAnnotation.State) => {
    const outputSchema = z.object({
      tweetReply: z.string().describe("The twwet reploy"),
    });

    const model = langchain().getModel().withStructuredOutput(outputSchema);

    const botAccount = await twitterAuth().getAuthenticatedBotAccount();

    // Retrieve conversation
    // TODO: store in state for multiple agents to use it?
    const conversation = await xPosts().getConversation(reply.postId);
    if (!conversation)
      return state;

    let replyGuidelines = "";
    for (var trait of state.tweetTraits) {
      switch (trait) {
        case TweetTrait.Pricing:
          replyGuidelines += `- Tell that we don't provide market price advice, using a bit of humor.\n`;
          break;
        case TweetTrait.Cheerful:
          replyGuidelines += `- Be grateful to the positive message received if it was a compliment, or simply reply with the positive vibes.\n`;
          break;
        case TweetTrait.Opinion:
          replyGuidelines += `- Give your opinion about what the user stated. You can agree or disagree but be factual.`;
          break;
        //TODO: OTHER TRAITS
      }
    }

    const SYSTEM_TEMPLATE = `
    The conversation is a twitter conversation. We have decided to write a reply for it. The parent tweet you are
    replying to has been analyzed and you should include only the following items in the answer:

    ${replyGuidelines}

    Here is the tweet:
    ---------------- 
    {tweetContent}`;

    // TODO: conversation history
    // TODO: last message should ask to generate the reply

    // No actual user message, everything is in the system prompt.
    const messages: BaseMessageLike[] = [["system", SYSTEM_TEMPLATE]];

    for (var post of conversation) {
      if (post.authorId === botAccount.userId)
        messages.push(["ai", `[we wrote:] ${post.text}`])
      else
        messages.push(["human", `[twitter user ${post.authorId} wrote:] ${post.text}`])
    }

    messages.push(["system", "Write the tweet reply. Remember you are replying mostly to the most recent tweet but do not @ the use ID in the reply."]);

    const prompt = ChatPromptTemplate.fromMessages(messages);

    console.log("Generating tweet reply");
    const response = await prompt.pipe(model).invoke({ tweetContent: reply.text });

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