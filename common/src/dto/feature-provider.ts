import { RawZodSchema } from "./zod";

export type BotFeatureProvider = {
  type: string; // BotFeatureType
  description: string;
  configFormat: RawZodSchema;
}