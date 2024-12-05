import { BotFeatureGroupType } from "./feature";
import { RawZodSchema } from "./zod";

export type BotFeatureProvider = {
  groupType: BotFeatureGroupType;
  type: string; // BotFeatureType
  title: string;
  description: string;
  configFormat: RawZodSchema;
}