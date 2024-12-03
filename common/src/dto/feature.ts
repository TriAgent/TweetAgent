export enum BotFeatureType {
  Core_XPostsFetcher = 'Core_XPostsFetcher',
  Core_XPostsHandler = 'Core_XPostsHandler',
  Core_XPostsSender = 'Core_XPostsSender',
  AirdropContest_AirdropSender = 'AirdropContest_AirdropSender',
  AirdropContest_AirdropSnapshot = 'AirdropContest_AirdropSnapshot',
  AirdropContest_XPostAirdropAddress = 'AirdropContest_XPostAirdropAddress',
  AirdropContest_XPostContestHandler = 'AirdropContest_XPostContestHandler',
  AirdropContest_XPostContestReposter = 'AirdropContest_XPostContestReposter',
  NewsSummaries_XNewsSummaryReplier = 'NewsSummaries_XNewsSummaryReplier',
  NewsSummaries_XNewsSummaryWriter = 'NewsSummaries_XNewsSummaryWriter',
  NewsSummaries_XRealNewsFilter = 'NewsSummaries_XRealNewsFilter'
};

export type BotFeature = {
  id: string;
  key: BotFeatureType;
  botId: string;

  config: any; // json custom config specific to each feature
}

export type ActiveFeature = {
  botId: string;
  key: BotFeatureType;
  method?: string; // specific method/action inside the feature that is being called. undefined if nothing going on.
  date: string; // ISO
}