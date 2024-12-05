import { BotFeature } from "@services/features/model/bot-feature";
import { BotFeatureProvider } from "@services/features/model/bot-feature-provider";
import { FC, useCallback } from "react";
import { ObjectEntry } from "./entries/object.entry";

export type OnInputChangeHandler = (newInput: any) => void;

export const FeatureConfigEditor: FC<{
  provider: BotFeatureProvider;
  feature: BotFeature;
  onChange: OnInputChangeHandler; // Returns null is input is not valid
}> = ({ provider, feature, onChange }) => {
  const handleChange = useCallback((newInput: string[]) => {
    onChange(newInput);
  }, [onChange]);

  if (!feature?.config)
    return null;

  return (
    <ObjectEntry label={null} inputFormat={provider.configFormat} value={feature.config} onValueChange={handleChange} />
  )
}
