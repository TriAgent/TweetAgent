import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { BotFeature } from "src/bot/model/bot-feature";
import { XPostReplyAnalysisResult } from "src/bot/model/x-post-reply-analysis-result";
import { extractAddressAgent } from "./extract-address.agent";

export const airdropAddressStateAnnotation = Annotation.Root({
  isAnAirdropAddressRequest: Annotation<boolean>,
  airdropAddress: Annotation<string>,
  reply: Annotation<string>
});

@Injectable()
export class XPostAirdropAddressService extends BotFeature {
  private logger = new Logger("XPostAirdropAddress");

  constructor() {
    super(5);
  }

  async studyReplyToXPost(post: XPost): Promise<XPostReplyAnalysisResult> {
    this.logger.log("Studying reply to X post");

    // AI agent that checks if the post contains an EVM address, and saves it to DB for the post owner.
    // Writes a reply part only if an address was handled.
    const graph = new StateGraph(airdropAddressStateAnnotation)
      .addNode("ExtractAddress", extractAddressAgent(this.logger, post))
      .addEdge(START, END)
      .addEdge(START, "ExtractAddress")
      .addEdge("ExtractAddress", END)

    const app = graph.compile();
    const result: typeof airdropAddressStateAnnotation.State = await app.invoke({});

    return { reply: result?.reply }
  }
}