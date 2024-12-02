import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeatureType } from "@prisma/client";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase } from "src/bot-feature/model/bot-feature-provider";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { BotConfig } from "src/config/bot-config";
import { AppLogger } from "src/logs/app-logger";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { infer as zodInfer } from "zod";
import { studyForContestAgent } from "./study-for-contest.agent";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  //snapshotInterval: z.number().describe('Min delay (in seconds) between 2 airdrop snapshots')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostContestHandlerProvider extends BotFeatureProvider<XPostContestHandlerFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureType.AirdropContest_XPostContestHandler,
      `Classifies upcoming X posts as eligible for the airdrop contest or not`,
      FeatureConfigFormat,
      (bot: Bot) => new XPostContestHandlerFeature(this, bot)
    );
  }

  protected getDefaultConfig(): Required<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: false,
      //snapshotInterval: 24 * 60 * 60 // 1 per day
    }
  }
}

export const contestHandlerStateAnnotation = Annotation.Root({
  isWorthForContest: Annotation<boolean>,
  reply: Annotation<string>
});

/**
 * This feature handles upcoming posts and checks if they are eligible for the airdrop contest,
 * then reply to users if they are.
 */
export class XPostContestHandlerFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostContestHandler", this.bot);

  constructor(provider: XPostContestHandlerProvider, bot: Bot) {
    super(provider, bot, 5);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async studyReplyToXPost(post: XPostWithAccount): Promise<XPostReplyAnalysisResult> {
    this.logger.log("Studying reply to X post");

    const graph = new StateGraph(contestHandlerStateAnnotation)
      .addNode("StudyForContest", studyForContestAgent(this, this.logger, post))
      .addEdge(START, END)
      .addEdge(START, "StudyForContest")
      .addEdge("StudyForContest", END)

    const app = graph.compile();
    const result: typeof contestHandlerStateAnnotation.State = await app.invoke({});

    return { reply: result?.reply }
  }
}