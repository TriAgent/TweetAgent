import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeatureType, XPost } from "@prisma/client";
import moment from "moment";
import { Bot } from "src/bots/model/bot";
import { BotFeature } from "src/bots/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { AppLogger } from "src/logs/app-logger";
import { prisma } from "src/services";
import { electBestPostForContestAgent } from "./elect-best-post-for-contest.agent";
import { writePostQuoteContentAgent } from "./write-post-quote-content.agent";

export const contestReposterStateAnnotation = Annotation.Root({
  electedPost: Annotation<XPost>,
  reply: Annotation<string>
});

/**
 * This feature publishes RTs of elected contest posts from time to time.
 */
export class XPostContestReposterFeature extends BotFeature {
  private logger = new AppLogger("XPostContestReposter", this.bot);

  constructor(bot: Bot) {
    super(BotFeatureType.AirdropContest_XPostContestReposter, bot, 20);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // Ensure to not elect/RT contest posts too often (like every 1 hour)
    const mostRecentContestQuote = await prisma().xPost.findFirst({
      where: {
        botId: this.bot.id,
        contestQuotedPost: { isNot: null }
      },
      orderBy: { createdAt: "desc" }
    });

    if (mostRecentContestQuote && moment().diff(mostRecentContestQuote.createdAt, "minutes") < 60)
      return;

    this.logger.log(`Post contest reposter scheduled execution`);

    const graph = new StateGraph(contestReposterStateAnnotation)
      .addNode("ElectBestPost", electBestPostForContestAgent(this, this.logger))
      .addNode("WriteQuoteIntro", writePostQuoteContentAgent(this, this.logger));

    graph.addEdge(START, "ElectBestPost")
      .addEdge("ElectBestPost", "WriteQuoteIntro")
      .addEdge("WriteQuoteIntro", END)

    const app = graph.compile();
    const result: typeof contestReposterStateAnnotation.State = await app.invoke({});

    if (result?.electedPost && result?.reply) {
      // A post has been elected for quoting. Schedule the post to X and mark it has handled.

      // Schedule the post
      this.logger.log("Scheduling new X reply post");
      await prisma().xPost.create({
        data: {
          bot: { connect: { id: this.bot.dbBot.id } },
          publishRequestAt: new Date(),
          text: result.reply,
          xAccount: { connect: { userId: this.bot.dbBot.twitterUserId } },
          quotedPostId: result.electedPost.postId, // twitter id
          contestQuotedPost: { connect: { id: result.electedPost.id } },
          isSimulated: result.electedPost.isSimulated
        }
      });

      // Mark user's source post as handled for the contest so we don't try to use it any more.
      await prisma().xPost.update({
        where: { id: result.electedPost.id },
        data: {
          quotedForAirdropContestAt: new Date()
        }
      });
    }
  }
}