import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeatureType } from "@prisma/client";
import { Bot } from "src/bots/model/bot";
import { BotFeature } from "src/bots/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bots/model/x-post-reply-analysis-result";
import { BotConfig } from "src/config/bot-config";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { extractAddressAgent } from "./extract-address.agent";
import { AppLogger } from "src/logs/app-logger";

export const airdropAddressStateAnnotation = Annotation.Root({
  isAnAirdropAddressRequest: Annotation<boolean>,
  airdropAddress: Annotation<string>,
  reply: Annotation<string>
});

export class XPostAirdropAddressFeature extends BotFeature {
  private logger = new AppLogger("XPostAirdropAddress", this.bot);

  constructor(bot: Bot) {
    super(BotFeatureType.AirdropContest_XPostAirdropAddress, bot, 20);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async studyReplyToXPost(post: XPostWithAccount): Promise<XPostReplyAnalysisResult> {
    this.logger.log("Studying reply to X post");

    // AI agent that checks if the post contains an EVM address, and saves it to DB for the post owner.
    // Writes a reply part only if an address was handled.
    const graph = new StateGraph(airdropAddressStateAnnotation)
      .addNode("ExtractAddress", extractAddressAgent(this, this.logger, post))
      .addEdge(START, "ExtractAddress")
      .addEdge("ExtractAddress", END)

    const app = graph.compile();
    const result: typeof airdropAddressStateAnnotation.State = await app.invoke({});

    return { reply: result?.reply }
  }
}