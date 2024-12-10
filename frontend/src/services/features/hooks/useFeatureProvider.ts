import { useMemo } from "react";
import { BotFeature } from "../model/bot-feature";
import { BotFeatureProvider } from "../model/bot-feature-provider";
import { useFeatureProviders } from "./useFeatureProviders";

export const useFeatureProvider = (feature: BotFeature): BotFeatureProvider => {
  const providers = useFeatureProviders();
  return useMemo(() => providers?.find(provider => provider.type === feature?.type), [feature, providers]);
}