import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { XPostReplyAnalysisResult } from "src/bot-feature/model/x-post-reply-analysis-result";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { z, infer as zodInfer } from "zod";
import { extractAddress } from "./default-prompts";
import { extractAddressAgent } from "./extract-address.agent";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  _prompts: z.object({
    extractAddress: z.string()
  })
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostAirdropAddressProvider extends BotFeatureProvider<XPostAirdropAddressFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.AirdropContest,
      BotFeatureType.AirdropContest_XPostAirdropAddress,
      `Airdrop address collector`,
      `Collects user airdrop addresses from X posts and acknowledges with a reply when successfully handled`,
      FeatureConfigFormat,
      (bot: Bot) => new XPostAirdropAddressFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      _prompts: {
        extractAddress
      }
    }
  }
}

export const airdropAddressStateAnnotation = Annotation.Root({
  isAnAirdropAddressRequest: Annotation<boolean>,
  airdropAddress: Annotation<string>,
  reply: Annotation<string>
});

export class XPostAirdropAddressFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostAirdropAddress", this.bot);

  constructor(provider: XPostAirdropAddressProvider, bot: Bot) {
    super(provider, bot, 20);
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