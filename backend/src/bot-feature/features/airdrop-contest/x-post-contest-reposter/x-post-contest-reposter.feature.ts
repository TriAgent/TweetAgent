import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { XPost } from "@prisma/client";
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import moment from "moment";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { prisma, xPostsService } from "src/services";
import { z, infer as zodInfer } from "zod";
import { electBestPostForContest, writePostQuoteContent } from "./default-prompts";
import { electBestPostForContestAgent } from "./elect-best-post-for-contest.agent";
import { writePostQuoteContentAgent } from "./write-post-quote-content.agent";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  quoteInterval: z.number().describe('Min delay (in seconds) between 2 rt/quotes of contest posts'),
  _prompts: z.object({
    electBestPostForContest: z.string(),
    writePostQuoteContent: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostContestReposterProvider extends BotFeatureProvider<XPostContestReposterFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.AirdropContest,
      BotFeatureType.AirdropContest_XPostContestReposter,
      `Post reposter`,
      `Quotes user posts from time to time, for the airdrop contest`,
      FeatureConfigFormat,
      (bot: Bot) => new XPostContestReposterFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      quoteInterval: 1 * 60 * 60, // 1 hour
      _prompts: {
        electBestPostForContest,
        writePostQuoteContent
      }
    }
  }
}

export const contestReposterStateAnnotation = Annotation.Root({
  electedPost: Annotation<XPost>,
  reply: Annotation<string>
});

/**
 * This feature publishes RTs of elected contest posts from time to time.
 */
export class XPostContestReposterFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostContestReposter", this.bot);

  constructor(provider: XPostContestReposterProvider, bot: Bot) {
    super(provider, bot, 20);
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

    if (mostRecentContestQuote && moment().diff(mostRecentContestQuote.createdAt, "seconds") < this.config.quoteInterval)
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
      await xPostsService().createPost(this.bot.dbBot, this.bot.dbBot.twitterUserId, result.reply, {
        isSimulated: result.electedPost.isSimulated,
        quotedPostId: result.electedPost.postId,
        contestQuotedPostId: result.electedPost.id
      });

      // Mark user's source post as handled for the contest so we don't try to use it any more.
      await xPostsService().updatePost(result.electedPost.id, {
        quotedForAirdropContestAt: new Date()
      });
    }
  }
}