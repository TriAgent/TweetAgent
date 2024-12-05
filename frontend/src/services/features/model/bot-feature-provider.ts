import type { BotFeatureGroupType, RawZodSchema } from "@x-ai-wallet-bot/common";
import { BotFeatureProvider as BotFeatureProviderDTO } from "@x-ai-wallet-bot/common";
import { Expose } from "class-transformer";

export class BotFeatureProvider implements BotFeatureProviderDTO {
  @Expose() public groupType: BotFeatureGroupType;
  @Expose() public type: string;
  @Expose() public title: string;
  @Expose() public description: string;
  @Expose() public configFormat: RawZodSchema;
}