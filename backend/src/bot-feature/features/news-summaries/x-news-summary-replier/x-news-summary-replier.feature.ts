import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeatureType } from "@prisma/client";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { xPostsService } from "src/services";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { classifyPostAgent } from "./classify-post.agent";
import { ReplierNode } from "./model/replier-node";
import { postReplyRouter } from "./post-reply.router";
import { replyAgent } from "./reply.agent";

const ProduceRepliesCheckDelaySec = 60; // 1 minute - interval between loops that check if a reply has to be produced

import { BotFeatureGroupType } from "@x-ai-wallet-bot/common";
import { BotFeatureProvider, BotFeatureProviderConfigBase } from "src/bot-feature/model/bot-feature-provider";
import { infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  //snapshotInterval: z.number().describe('Min delay (in seconds) between 2 airdrop snapshots')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XNewsSummaryReplierProvider extends BotFeatureProvider<XNewsSummaryReplierFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.NewsSummaries,
      BotFeatureType.NewsSummaries_XNewsSummaryReplier,
      `Post handler`,
      `Write replies to users posts following our news summary posts`,
      FeatureConfigFormat,
      (bot: Bot) => new XNewsSummaryReplierFeature(this, bot)
    );
  }

  public getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      //snapshotInterval: 24 * 60 * 60 // 1 per day
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
 * This feature generates replies to X users that posted in reply to our news summary posts.
 */
export class XNewsSummaryReplierFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("NewsSummaryReplier", this.bot);

  constructor(provider: XNewsSummaryReplierProvider, bot: Bot) {
    super(provider, bot, ProduceRepliesCheckDelaySec);
  }

  /**
   * Checks if some new replies have been sent to us as a reply to our news summaries,
   * and try to answer them.
   */
  async studyReplyToXPost?(xPost: XPostWithAccount): Promise<XPostReplyAnalysisResult> {
    // Don't reply to ourself
    if (xPost.xAccountUserId === this.bot.dbBot.twitterUserId)
      return null;

    // Get conversation thread for this post. If not a conversation we started with a news post,
    // don't reply here.
    const conversation = await xPostsService().getParentConversation(this.bot, xPost.postId);
    if (!conversation || conversation.length === 0 || conversation[0].botId != this.bot.dbBot.id)
      return;

    this.logger.log("Building X reply for post:");
    this.logger.log(xPost);

    const tools = [];
    const _classifyReplyAgent = classifyPostAgent(this, xPost);
    const _shouldReplyRouter = postReplyRouter(tools, xPost);
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