export type BotFeatureConfig = {
  id: string;
  key: string; // BotFeatureType
  botId: string;

  enabled: boolean;
  config: any; // json custom config specific to each feature
}