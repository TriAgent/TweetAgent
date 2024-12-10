import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { xPostsService } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { classifyPostAgent } from "./classify-post.agent";
import { ReplierNode } from "./model/replier-node";
import { replyAgent } from "./reply.agent";
import { shouldReplyRouter } from "./should-reply.router";

const ProduceRepliesCheckDelaySec = 60; // 1 minute - interval between loops that check if a reply has to be produced

import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { z, infer as zodInfer } from "zod";
import { classifyPost, replyClassificationTraitCheerful, replyClassificationTraitOpinion, replyClassificationTraitPricing, replyClassificationTraitQuestion, replyToNewsCommand, replyToNewsIntroduction } from "./default-prompts";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  _prompts: z.object({
    classifyPost: z.string(),
    replyClassificationTraitPricing: z.string(),
    replyClassificationTraitCheerful: z.string(),
    replyClassificationTraitQuestion: z.string(),
    replyClassificationTraitOpinion: z.string(),
    replyToNewsIntroduction: z.string(),
    replyToNewsCommand: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class GenericReplierProvider extends BotFeatureProvider<GenericReplierFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.Core,
      BotFeatureType.Core_GenericReplier,
      `Generic replier`,
      `Potentially writes generic replies to users posts for all interactions with us. Posts are first studied to decide if they are worth being replied or not. Then depending on their content, different kind of reply guidelines are used to produce replies.`,
      FeatureConfigFormat,
      (bot: Bot) => new GenericReplierFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      _prompts: {
        classifyPost,
        replyClassificationTraitPricing,
        replyClassificationTraitCheerful,
        replyClassificationTraitOpinion,
        replyClassificationTraitQuestion,
        replyToNewsIntroduction,
        replyToNewsCommand
      }
    }
  }
}

export let replierStateAnnotation = Annotation.Root({
  tweetTraits: Annotation<string[]>({
    value: (current, update) => update,
    default: () => []
  }),
  tweetReply: Annotation<string>
});

/**
 * This feature generates replies to X users that posted by mentioning us.
 */
export class GenericReplierFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("GenericReplier", this.bot);

  constructor(provider: GenericReplierProvider, bot: Bot) {
    super(provider, bot, ProduceRepliesCheckDelaySec);
  }

  /**
   * Checks if some new replies have been sent to us as and try to answer them.
   */
  async studyReplyToXPost?(xPost: XPostWithAccount): Promise<XPostReplyAnalysisResult> {
    // Don't reply to ourself
    if (xPost.xAccountUserId === this.bot.dbBot.twitterUserId)
      return null;

    // Get conversation thread for this post. 
    const conversation = await xPostsService().getParentConversation(this.bot, xPost.postId);
    if (!conversation || conversation.length === 0)
      return null;

    // Only study reply if we are somewhere in the conversation, as author or mentioned in a post text
    const botInConversationAuthors = conversation.find(post => post.xAccountUserId === this.bot.dbBot.twitterUserId);
    const botIsMentioned = conversation.find(post => this.bot.isMentionedInPostText(post.text));
    if (!botInConversationAuthors && !botIsMentioned)
      return null;

    this.logger.log("Generating generic X reply for post:");
    this.logger.log(xPost);

    const tools = [];
    const _classifyReplyAgent = classifyPostAgent(this, xPost);
    const _shouldReplyRouter = shouldReplyRouter(tools, xPost);
    const _replyAgent = replyAgent(this, xPost);

    const graph = new StateGraph(replierStateAnnotation)
      .addNode(ReplierNode.Classify, _classifyReplyAgent)
      .addNode(ReplierNode.DecideToReply, _shouldReplyRouter)
      .addNode(ReplierNode.Reply, _replyAgent)

    graph
      .addEdge(START, ReplierNode.Classify) // when starting, classify / get traits
      .addConditionalEdges(ReplierNode.Classify, _shouldReplyRouter) // after classification, decide to reply or not
      .addEdge(ReplierNode.Reply, END) // After replying, end

    const app = graph.compile();
    const result: typeof replierStateAnnotation.State = await app.invoke({});

    this.logger.log("Reply generation result:");
    this.logger.log(result);

    return { reply: result.tweetReply };
  }
}