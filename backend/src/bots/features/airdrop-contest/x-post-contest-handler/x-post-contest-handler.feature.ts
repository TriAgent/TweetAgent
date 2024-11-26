import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Logger } from "@nestjs/common";
import { BotFeatureType } from "@prisma/client";
import { Bot } from "src/bots/model/bot";
import { BotFeature } from "src/bots/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bots/model/x-post-reply-analysis-result";
import { BotConfig } from "src/config/bot-config";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { studyForContestAgent } from "./study-for-contest.agent";

export const contestHandlerStateAnnotation = Annotation.Root({
  isWorthForContest: Annotation<boolean>,
  reply: Annotation<string>
});

/**
 * This feature handles upcoming posts and checks if they are eligible for the airdrop contest,
 * then reply to users if they are.
 */
export class XPostContestHandlerFeature extends BotFeature {
  private logger = new Logger("XPostContestHandler");

  constructor(bot: Bot) {
    super(BotFeatureType.AirdropContest_XPostContestHandler, bot, 5);
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