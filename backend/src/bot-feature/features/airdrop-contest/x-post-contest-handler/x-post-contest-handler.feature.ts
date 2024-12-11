import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeature as DBBotFeature } from '@prisma/client';
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { z, infer as zodInfer } from "zod";
import { studyContestRequest, studyForContest } from "./default-prompts";
import { studyContestRequestAgent } from "./study-contest-request.agent";
import { studyWorthForContestAgent } from "./study-worth-for-contest.agent";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  maxPostAge: z.number().describe("Post must not be older (published date) than this number of seconds to have a chance to get elected"),
  _prompts: z.object({
    studyContestRequest: z.string(),
    studyForContest: z.string(),
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostContestHandlerProvider extends BotFeatureProvider<XPostContestHandlerFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.AirdropContest,
      BotFeatureType.AirdropContest_XPostContestHandler,
      `Post handler`,
      `Classifies upcoming X posts as eligible for the airdrop contest or not`,
      FeatureConfigFormat,
      (bot, dbFeature) => new XPostContestHandlerFeature(this, bot, dbFeature)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      maxPostAge: 6 * 60 * 60, // 6 hours
      _prompts: {
        studyContestRequest,
        studyForContest
      }
    }
  }
}

export const contestHandlerStateAnnotation = Annotation.Root({
  isContestRequest: Annotation<boolean>, // Evaluated post must request to join the contest
  isWorthForContest: Annotation<boolean>, // Target post (eg: conversation root) must be worth for contest
  reply: Annotation<string>
});

/**
 * This feature handles upcoming posts and checks if they are eligible for the airdrop contest,
 * then reply to users if they are.
 */
export class XPostContestHandlerFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostContestHandler", this.bot);

  constructor(provider: XPostContestHandlerProvider, bot: Bot, dbFeature: DBBotFeature) {
    super(provider, bot, dbFeature, 5);
  }

  async studyReplyToXPost(post: XPostWithAccount): Promise<XPostReplyAnalysisResult> {
    this.logger.log("Studying reply to X post");

    // Don't reply to ourself
    if (post.xAccountUserId === this.bot.dbBot.twitterUserId)
      return null;

    const graph = new StateGraph(contestHandlerStateAnnotation)
      .addNode("StudyContestRequest", studyContestRequestAgent(this, this.logger, post))
      .addNode("StudyForContest", studyWorthForContestAgent(this, this.logger, post))
      .addEdge(START, "StudyContestRequest")
      .addConditionalEdges("StudyContestRequest", (input) => input.isContestRequest ? "StudyForContest" : END)
      .addEdge("StudyForContest", END)

    const app = graph.compile();
    const result: typeof contestHandlerStateAnnotation.State = await app.invoke({});

    return { reply: result?.reply }
  }
}