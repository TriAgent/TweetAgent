export type BotConfigProviderConfigType = {
  enabled: boolean; // TODO KO: should be ZOD format
}

export type BotFeatureProvider<ConfigType extends BotConfigProviderConfigType> = {
  type: string; // BotFeatureType
  description: string;
  configFormat: ConfigType;
}