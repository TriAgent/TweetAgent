import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { BotFeature } from "src/bot/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { studyForContestAgent } from "./study-for-contest.agent";

export const contestHandlerStateAnnotation = Annotation.Root({
  isWorthForContest: Annotation<boolean>,
  reply: Annotation<string>
});

/**
 * This feature handles upcoming posts and checks if they are eligible for the airdrop contest,
 * then reply to users if they are.
 */
@Injectable()
export class XPostContestHandlerService extends BotFeature {
  private logger = new Logger("XPostContestHandler");

  constructor() {
    super(5);
  }

  ex

  async studyReplyToXPost(post: XPost): Promise<XPostReplyAnalysisResult> {
    this.logger.log("Studying reply to X post");

    const graph = new StateGraph(contestHandlerStateAnnotation)
      .addNode("StudyForContest", studyForContestAgent(this.logger, post))
      .addEdge(START, END)
      .addEdge(START, "StudyForContest")
      .addEdge("StudyForContest", END)

    const app = graph.compile();
    const result: typeof contestHandlerStateAnnotation.State = await app.invoke({});

    return { reply: result?.reply }
  }
}