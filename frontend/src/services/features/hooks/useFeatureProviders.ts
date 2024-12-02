import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { botFeatureProviders$ } from "../features.service";

export const useFeatureProviders = () =>{ 
  return useBehaviorSubject(botFeatureProviders$);
}