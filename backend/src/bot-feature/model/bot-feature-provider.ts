import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { Bot } from "src/bots/model/bot";
import { z, infer as zodInfer } from "zod";
import { BotFeature } from "./bot-feature";

export const BotFeatureProviderConfigBase = z.object({
  enabled: z.boolean().describe("Whether to run this feature or not")
}).strict();

export type BotFeatureConfigBase = zodInfer<typeof BotFeatureProviderConfigBase>;

export abstract class BotFeatureProvider<FeatureType extends BotFeature<any>, ConfigFormat extends typeof BotFeatureProviderConfigBase> {
  constructor(
    public groupType: BotFeatureGroupType,
    public type: BotFeatureType,
    public title: string,
    public description: string,
    public configFormat: ConfigFormat, // Zod config 
    private instanceBuilder: (bot: Bot) => FeatureType
  ) { }

  public newInstance(bot: Bot): FeatureType {
    return this.instanceBuilder(bot);
  }

  public abstract getDefaultConfig(): Required<zodInfer<ConfigFormat>>;
}

export type AnyBotFeatureProvider = BotFeatureProvider<any, any>;