export enum BotFeatureGroupType {
  Core = 'Core',
  XCore = 'XCore',
  AirdropContest = 'AirdropContest',
  NewsSummaries = 'NewsSummaries'
}

export enum BotFeatureType {
  Core_RootScheduler = 'Core_RootScheduler',
  Core_GenericReplier = 'Core_GenericReplier',
  XCore_PostFetcher = 'XCore_PostFetcher',
  XCore_PostHandler = 'XCore_PostHandler',
  XCore_PostsSender = 'XCore_PostsSender',
  AirdropContest_AirdropSender = 'AirdropContest_AirdropSender',
  AirdropContest_AirdropSnapshot = 'AirdropContest_AirdropSnapshot',
  AirdropContest_XPostAirdropAddress = 'AirdropContest_XPostAirdropAddress',
  AirdropContest_XPostContestHandler = 'AirdropContest_XPostContestHandler',
  AirdropContest_XPostContestReposter = 'AirdropContest_XPostContestReposter',
  NewsSummaries_XNewsSummaryWriter = 'NewsSummaries_XNewsSummaryWriter',
  NewsSummaries_XRealNewsFilter = 'NewsSummaries_XRealNewsFilter'
};

export type BotFeature = {
  id: string;
  type: BotFeatureType;
  botId: string;

  config: any; // json custom config specific to each feature
}

export type ActiveFeature = {
  botId: string;
  key: BotFeatureType;
  method?: string; // specific method/action inside the feature that is being called. undefined if nothing going on.
  date: string; // ISO
}