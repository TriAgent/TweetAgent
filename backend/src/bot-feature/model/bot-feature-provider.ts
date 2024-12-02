import { BotFeatureType } from "@prisma/client";
import { Bot } from "src/bots/model/bot";
import { z, infer as zodInfer } from "zod";
import { BotFeature } from "./bot-feature";

export const BotFeatureProviderConfigBase = z.object({
  enabled: z.boolean().describe("xxxxxx")
}).strict();

export type BotFeatureConfigBase = zodInfer<typeof BotFeatureProviderConfigBase>;

export abstract class BotFeatureProvider<FeatureType extends BotFeature<any>, ConfigFormat extends typeof BotFeatureProviderConfigBase> {
  constructor(
    public type: BotFeatureType,
    public description: string,
    public configFormat: ConfigFormat, // Zod config 
    private instanceBuilder: (bot: Bot) => FeatureType
  ) { }

  public newInstance(bot: Bot): FeatureType {
    return this.instanceBuilder(bot);
  }

  protected abstract getDefaultConfig(): Required<zodInfer<ConfigFormat>>;
}

export type AnyBotFeatureProvider = BotFeatureProvider<any, any>;