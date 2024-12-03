import type { RawZodSchema } from "@x-ai-wallet-bot/common";
import { Expose } from "class-transformer";

export class BotFeatureProvider {
  @Expose() public type: string;
  @Expose() public description: string;
  @Expose() public configFormat: RawZodSchema;
}