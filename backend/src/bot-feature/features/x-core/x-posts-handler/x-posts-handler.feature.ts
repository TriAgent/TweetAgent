import { Annotation, BaseChannel, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeature as DBBotFeature } from '@prisma/client';
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { standardStringAnnotationReducer } from "src/langchain/utils";
import { AppLogger } from "src/logs/app-logger";
import { debugCommentService, prisma, wsDispatcherService, xPostsService } from "src/services";
import { z, infer as zodInfer } from "zod";
import { produceAggregatedReplyAgent } from "./aggregated-reply.agent";
import { produceAggregatedReply } from "./default-prompts";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  _prompts: z.object({
    produceAggregatedReply: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostsHandlerProvider extends BotFeatureProvider<XPostsHandlerFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.XCore,
      BotFeatureType.XCore_PostHandler,
      `Root handler for upcoming X posts`,
      `Root handler for unanswered third party posts. Requests other features to produce potential reply parts, then aggregates all the replies into a single tweet.`,
      FeatureConfigFormat,
      (bot, dbFeature) => new XPostsHandlerFeature(this, bot, dbFeature)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      _prompts: {
        produceAggregatedReply
      }
    }
  }
}

type ReplyAggregatorStateAnnotationSchema = {
  fullTweet: BaseChannel<string>,
}

export let replyAggregatorStateAnnotation = Annotation.Root<ReplyAggregatorStateAnnotationSchema>({
  fullTweet: standardStringAnnotationReducer()
});

/**
 * Service responsible for handling saved X posts that interacted with our X account,
 * and decide whether to reply or not.
 * 
 * Replies are built by asking other features to categorize and build reply parts.
 */
export class XPostsHandlerFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostsHandler", this.bot);

  constructor(provider: XPostsHandlerProvider, bot: Bot, dbFeature: DBBotFeature) {
    super(provider, bot, dbFeature, 20);
  }

  public async scheduledExecution() {
    await this.checkUnhandledPosts();
  }

  private async checkUnhandledPosts() {
    this.logger.log("Checking unhandled posts to potentially create replies");

    // Find the first post eligible for a reply analysis. ie posts that have not been handled yet.
    const xPost = await prisma().xPost.findFirst({
      where: {
        botId: this.bot.id,
        wasReplyHandled: false
      },
      include: { xAccount: true }
    });

    if (!xPost)
      return; // Nothing to deal with for now

    // Go through all features and gather feedbacks about a post's potential reply.
    // If any content to produce, schedule a new X post.
    const replyAnalysisResults: XPostReplyAnalysisResult[] = [];
    for (const feature of this.bot.getActiveFeatures()) {
      if (feature.isEnabled() && feature.studyReplyToXPost) {
        wsDispatcherService().emitMostRecentFeatureAction(this.bot, feature, "studyReplyToXPost");
        const replyAnalysisResult = await feature.studyReplyToXPost(xPost);
        if (replyAnalysisResult?.reply) {
          replyAnalysisResults.push(replyAnalysisResult);
        }
      }
    }

    let replyGenerated = false;
    if (replyAnalysisResults.length > 0) {
      const fullReply = await this.produceAggregatedXReply(replyAnalysisResults);
      if (fullReply) {
        // Schedule a post
        this.logger.log(`Scheduling new X reply post: ${fullReply}`);

        await xPostsService().createPost(this.bot.dbBot, this.bot.dbBot.twitterUserId, fullReply, {
          isSimulated: xPost.isSimulated,
          parentPostId: xPost.postId,
          publishRequestAt: new Date()
        });

        replyGenerated = true;
      }
    }

    if (!replyGenerated)
      await debugCommentService().createPostComment(xPost, `None of the enabled reply handlers wanted to write a reply.`, this.dbFeature);

    // No matter if we could generate a reply or not, mark as reply as 
    // handled, so we don't try to handle it again later. A missed reply is better than being stuck forever.
    await xPostsService().markReplyHandled(xPost);
  }

  /**
   * In case multiple features wanted to reply about a user post (if user message contains a question, his
   * airdrop address, etc), we ask AI to create an homogenous, aggregated reply based on several reply parts.
   */
  private async produceAggregatedXReply(replyAnalysisResults: XPostReplyAnalysisResult[]): Promise<string> {
    const graph = new StateGraph(replyAggregatorStateAnnotation)
      .addNode("agent", produceAggregatedReplyAgent(this.logger, this, replyAnalysisResults))
      .addEdge(START, "agent")
      .addEdge("agent", END)

    const app = graph.compile();
    const result: typeof replyAggregatorStateAnnotation.State = await app.invoke({});

    return result?.fullTweet;
  }
}