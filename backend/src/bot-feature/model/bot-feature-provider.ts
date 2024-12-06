import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import { Bot } from "src/bots/model/bot";
import { z } from "zod";
import { BotFeature } from "./bot-feature";

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const BotFeatureProviderConfigBase = z.object({
  enabled: z.boolean().describe("Whether to run this feature or not"),
  //prompts: z.record(z.string(), z.string()).optional() // use a map, not an array, for easier deep merge during future changes.
}).strict();

export type BotFeatureConfigBase = z.infer<typeof BotFeatureProviderConfigBase>;

// Make all fields required, except the ones specifically noted as optional
export type DefaultFeatureConfigType<T extends BotFeatureConfigBase = BotFeatureConfigBase> = Required<T>; //Optional<Required<T>, "prompts">;

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

  public abstract getDefaultConfig(): DefaultFeatureConfigType;
}

export type AnyBotFeatureProvider = BotFeatureProvider<any, any>;