import { Annotation, BaseChannel, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { BotFeaturesService } from "src/bot/features.service";
import { BotFeature } from "src/bot/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { standardStringAnnotationReducer } from "src/langchain/utils";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { XPostsService } from "src/xposts/xposts.service";
import { produceAggregatedReplyAgent } from "./aggregated-reply.agent";

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
@Injectable()
export class XPostsHandlerService extends BotFeature {
  private logger = new Logger("XPostsHandler");

  constructor(
    private twitterAuth: TwitterAuthService,
    private prisma: PrismaService,
    private featuresService: BotFeaturesService,
    private xPosts: XPostsService
  ) {
    super(20);
  }

  public async scheduledExecution() {
    await this.checkUnhandledPosts();
  }

  private async checkUnhandledPosts() {
    this.logger.log("Checking unhandled posts to potentially create replies");

    const botAccount = await this.twitterAuth.getAuthenticatedBotAccount();

    // Find the first post eligible for a reply analysis. ie posts that have not been handled yet.
    const xPost = await this.prisma.xPost.findFirst({
      where: {
        xAccountUserId: { not: botAccount.userId },
        wasReplyHandled: false
      }
    });

    if (!xPost)
      return; // Nothing to deal with for now

    // Go through all features and gather feedbacks about a post's potential reply.
    // If any content to produce, schedule a new X post.
    const replyAnalysisResults: XPostReplyAnalysisResult[] = [];
    for (const feature of this.featuresService.getFeatures()) {
      if (feature.isEnabled() && feature.studyReplyToXPost) {
        const replyAnalysisResult = await feature.studyReplyToXPost(xPost);
        if (replyAnalysisResult?.reply) {
          replyAnalysisResults.push(replyAnalysisResult);
        }
      }
    }

    if (replyAnalysisResults.length > 0) {
      const fullReply = await this.produceAggregatedXReply(replyAnalysisResults);
      if (fullReply) {
        // Schedule a post
        this.logger.log(`Scheduling new X reply post: ${fullReply}`);

        await this.prisma.xPost.create({
          data: {
            publishRequestAt: new Date(),
            text: fullReply,
            xAccount: { connect: { userId: this.botAccount.userId } },
            botAccount: { connect: { userId: this.botAccount.userId } },
            parentPostId: xPost.postId,
            rootPostId: xPost.rootPostId
          }
        });
      }
    }

    // No matter if we could generate a reply or not, mark as reply as 
    // handled, so we don't try to handle it again later. A missed reply is better than being stuck forever.
    await this.xPosts.markAsReplied(xPost);
  }

  /**
   * In case multiple features wanted to reply about a user post (if user message contains a question, his
   * airdrop address, etc), we ask AI to create an homogenous, aggregated reply based on several reply parts.
   */
  private async produceAggregatedXReply(replyAnalysisResults: XPostReplyAnalysisResult[]): Promise<string> {
    const graph = new StateGraph(replyAggregatorStateAnnotation)
      .addNode("agent", produceAggregatedReplyAgent(replyAnalysisResults))
      .addEdge(START, "agent")
      .addEdge("agent", END)

    const app = graph.compile();
    const result: typeof replyAggregatorStateAnnotation.State = await app.invoke({});

    return result?.fullTweet;
  }
}