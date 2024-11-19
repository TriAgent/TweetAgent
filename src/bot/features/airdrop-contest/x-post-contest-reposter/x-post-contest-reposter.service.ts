import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { BotFeature } from "src/bot/model/bot-feature";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { XPostsService } from "src/xposts/xposts.service";
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
    private xPosts: XPostsService
  ) {
    super(10);
  }

  async scheduledExecution() {
    this.logger.log(`Post contest reposter scheduled execution`);

    // TODO: ensure 1h has passed

    // TODO: mark post as handled for contest

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

      const botAccount = await this.twitterAuth.getAuthenticatedBotAccount();

      // Schedule the post
      this.logger.log("Scheduling new X reply post");
      await this.prisma.xPost.create({
        data: {
          publishRequestAt: new Date(),
          text: result.reply,
          authorId: botAccount.userId,
          quotedPostId: result.electedPost.postId
        }
      });

      // Mark user's source post has handled for the contest so we don't try to use it any more.
      await this.prisma.xPost.update({
        where: { id: result.electedPost.id },
        data: {
          quotedForAirdropContestAt: new Date()
        }
      });
    }
  }
}