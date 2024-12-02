export type BotFeature = {
  id: string;
  key: string; // BotFeatureType
  botId: string;

  enabled: boolean;
  config: any; // json custom config specific to each feature
}

export type ActiveFeature = {
  botId: string;
  key: string; // feature key
  method?: string; // specific method/action inside the feature that is being called. undefined if nothing going on.
  date: string; // ISO
}