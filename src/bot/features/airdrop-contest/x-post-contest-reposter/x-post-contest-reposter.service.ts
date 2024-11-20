import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import * as moment from "moment";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { OperationHistoryService } from "src/operation-history/operation-history.service";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { electBestPostForContestAgent } from "./elect-best-post-for-contest.agent";
import { writePostQuoteContentAgent } from "./write-post-quote-content.agent";

export const contestReposterStateAnnotation = Annotation.Root({
  electedPost: Annotation<XPost>,
  reply: Annotation<string>
});

/**
 * This feature publishes RTs of elected contest posts from time to time.
 */
@Injectable()
export class XPostContestReposterService extends BotFeature {
  private logger = new Logger("XPostContestReposter");

  constructor(
    private prisma: PrismaService,
    private twitterAuth: TwitterAuthService,
    private operations: OperationHistoryService
  ) {
    super(20);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // Ensure to not elect/RT contest posts too often (like every 1 hour)
    const mostRecentContestQuote = await this.prisma.xPost.findFirst({
      where: {
        contestQuotedPost: { isNot: null }
      },
      orderBy: { createdAt: "desc" }
    });

    if (mostRecentContestQuote && moment().diff(mostRecentContestQuote.createdAt, "minutes") < 60)
      return;

    this.logger.log(`Post contest reposter scheduled execution`);

    const graph = new StateGraph(contestReposterStateAnnotation)
      .addNode("ElectBestPost", electBestPostForContestAgent(this.logger))
      .addNode("WriteQuoteIntro", writePostQuoteContentAgent(this.logger));

    graph.addEdge(START, "ElectBestPost")
      .addEdge("ElectBestPost", "WriteQuoteIntro")
      .addEdge("WriteQuoteIntro", END)

    const app = graph.compile();
    const result: typeof contestReposterStateAnnotation.State = await app.invoke({});

    if (result?.electedPost && result?.reply) {
      // A post has been elected for quoting. Schedule the post to X and mark it has handled.

      // Schedule the post
      this.logger.log("Scheduling new X reply post");
      await this.prisma.xPost.create({
        data: {
          publishRequestAt: new Date(),
          text: result.reply,
          authorId: this.botAccount.userId,
          quotedPostId: result.electedPost.postId, // twitter id
          contestQuotedPost: { connect: { id: result.electedPost.id } }
        }
      });

      // Mark user's source post as handled for the contest so we don't try to use it any more.
      await this.prisma.xPost.update({
        where: { id: result.electedPost.id },
        data: {
          quotedForAirdropContestAt: new Date()
        }
      });
    }
  }
}