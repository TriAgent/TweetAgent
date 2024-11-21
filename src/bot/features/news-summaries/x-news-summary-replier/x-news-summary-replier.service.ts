import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { BotFeature } from "src/bot/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { XPostsService } from "src/xposts/xposts.service";
import { classifyPostAgent } from "./classify-post.agent";
import { ReplierNode } from "./model/replier-node";
import { postReplyRouter } from "./post-reply.router";
import { replyAgent } from "./reply.agent";

const ProduceRepliesCheckDelaySec = 60; // 1 minute - interval between loops that check if a reply has to be produced

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
@Injectable()
export class XNewsSummaryReplierService extends BotFeature {
  private logger = new Logger("NewsSummaryReplier");

  constructor(
    private prisma: PrismaService,
    private twitterAuth: TwitterAuthService,
    private xPosts: XPostsService
  ) {
    super(ProduceRepliesCheckDelaySec);
  }

  public isEnabled(): boolean {
    return BotConfig.NewsSummaryBot.IsActive;
  }

  /**
   * Checks if some new replies have been sent to us as a reply to our news summaries,
   * and try to answer them.
   */
  async studyReplyToXPost?(xPost: XPost): Promise<XPostReplyAnalysisResult> {
    // Get conversation thread for this post. If not a conversation we started with a news post,
    // don't reply here.
    const conversation = await this.xPosts.getParentConversation(xPost.postId);
    if (!conversation || conversation.length === 0 || conversation[0].botAccountUserId != this.botAccount.userId)
      return;

    this.logger.log("Building X reply for post:");
    this.logger.log(xPost);

    const tools = [];
    const _classifyReplyAgent = classifyPostAgent(tools, xPost);
    const _shouldReplyRouter = postReplyRouter(tools, xPost);
    const _replyAgent = replyAgent(tools, xPost);

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