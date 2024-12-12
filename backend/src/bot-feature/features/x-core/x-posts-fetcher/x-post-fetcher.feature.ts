import { BotFeature as DBBotFeature, OperationHistoryType } from '@prisma/client';
import { BotFeatureGroupType, BotFeatureType } from '@x-ai-wallet-bot/common';
import { uniqWith } from 'lodash';
import moment from 'moment';
import { BotFeature } from 'src/bot-feature/model/bot-feature';
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from 'src/bot-feature/model/bot-feature-provider';
import { Bot } from 'src/bots/model/bot';
import { BotConfig } from 'src/config/bot-config';
import { AppLogger } from 'src/logs/app-logger';
import { operationHistoryService, twitterService, xAccountsService, xPostsService } from 'src/services';
import { TweetV2 } from 'twitter-api-v2';
import { z, infer as zodInfer } from "zod";

const FetchXTargetAccountPostsDelaySec = 1 * 60; // Don't call the api more than once every N minutes
const FetchXMentionPostsDelaySec = 1 * 60;

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  fetchNewsAccountsPosts: z.boolean().describe('Whether to fetch posts written on X by some accounts we follow, so we can for example summarize their posts later'),
  fetchPostsMentioningUs: z.boolean().describe('Whether to fetch all posts that mention our bot name')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class XPostsFetcherProvider extends BotFeatureProvider<XPostFetcherFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.XCore,
      BotFeatureType.XCore_PostFetcher,
      `Post fetcher`,
      `Fetches and caches X Posts`,
      FeatureConfigFormat,
      (bot, dbFeature) => new XPostFetcherFeature(this, bot, dbFeature)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<zodInfer<typeof FeatureConfigFormat>> {
    return {
      enabled: false,
      fetchNewsAccountsPosts: true,
      fetchPostsMentioningUs: true
    }
  }
}

/**
 * Service shared by all bot features to ensure required posts are fetched without duplicate requests,
 * as the number of posts we can read has a quota.
 */
export class XPostFetcherFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("XPostFetcher", this.bot);

  constructor(provider: XPostsFetcherProvider, bot: Bot, dbFeature: DBBotFeature) {
    super(provider, bot, dbFeature, 5);
  }

  public async scheduledExecution() {
    // Fetch posts from some targeted accounts
    if (this.config.fetchNewsAccountsPosts)
      await this.fetchLatestTargetAccountPosts();

    // Fetch posts we are mentioned in
    if (this.config.fetchPostsMentioningUs)
      await this.fetchLatestMentionPosts();
  }

  private async fetchLatestTargetAccountPosts() {
    const postFetcher = this.bot.getFeatureByType(BotFeatureType.XCore_PostFetcher) as XPostFetcherFeature;
    const { targetAccountNames } = await postFetcher.getMonitoredNewsAccountList();

    // Check when we last fetched - fetch max 12 hours ago if no previous history
    let latestFetchDate = await operationHistoryService().mostRecentOperationDate(OperationHistoryType.FetchAccountsPosts, 12 * 60);
    if (moment().diff(latestFetchDate, "seconds") < FetchXTargetAccountPostsDelaySec)
      return;

    const posts = await xPostsService().fetchAndSaveXPosts(this.bot, () => {
      // Fetch recent posts, not earlier than last time we checked
      this.logger.log(`Fetching recent target accounts X posts not earlier than ${latestFetchDate}`);
      // subtract 1 minute to compensate twitter's api lag after a post is published
      return twitterService().fetchAuthorsPosts(this.bot, targetAccountNames, moment(latestFetchDate).subtract(1, "minutes"));
    });

    if (posts != null) {
      // Remember last fetch time
      await operationHistoryService().saveRecentOperation(OperationHistoryType.FetchAccountsPosts);
    }
  }

  private async fetchLatestMentionPosts() {
    // Check when we last fetched
    let latestFetchDate = await operationHistoryService().mostRecentOperationDate(OperationHistoryType.FetchPostsWeAreMentionnedIn, 12 * 60);
    if (moment().diff(latestFetchDate, "seconds") < FetchXMentionPostsDelaySec)
      return;

    // Fetch recent posts, not earlier than last time we checked
    // Also fetch posts' related posts, but make sure to insert them all in DB at once to avoid first inserting 
    // posts in DB and take the risk of failing API calls while retrieving dependencies.
    const posts = await xPostsService().fetchAndSaveXPosts(this.bot, async () => {
      this.logger.log(`Fetching recent X posts we are mentioned in, not earlier than ${latestFetchDate}`);
      const fetchedTweets: TweetV2[] = [];
      // subtract 1 minute to compensate twitter's api lag after a post is published
      const mentioningTweets = await twitterService().fetchPostsMentioningOurAccount(this.bot, moment(latestFetchDate).subtract(1, "minutes"));
      if (!mentioningTweets)
        return [];

      fetchedTweets.push(...mentioningTweets);

      // For each post we get mentioned in, fetch and save the whole conversation before it (parent posts).
      // This is needed for example by the contest service to study the root post vs the mentioned post (possibly in replies).
      for (const tweet of mentioningTweets) {
        const quotedPostId = tweet.referenced_tweets?.find(t => t.type === "quoted")?.id;
        if (quotedPostId) {
          this.logger.log(`Fetching quoted post for mentioning post`);
          const quotePost = await twitterService().fetchSinglePost(this.bot, quotedPostId);
          if (!quotePost)
            return []; // Make the whole retrieval fail 
          fetchedTweets.push(quotePost);
        }

        this.logger.log(`Fetching parent conversation for mentioning post`);
        const parentPosts = await twitterService().fetchParentPosts(this.bot, tweet.id);
        if (!parentPosts)
          return []; // Make the whole retrieval fail 
        fetchedTweets.push(...parentPosts);
      }

      return uniqWith(fetchedTweets, (t1, t2) => t1.id === t2.id);
    });

    if (!posts)
      return;

    if (posts != null) {
      // Remember last fetch time
      await operationHistoryService().saveRecentOperation(OperationHistoryType.FetchPostsWeAreMentionnedIn);
    }
  }

  /**
 * Returns the list of accounts we follow as providers of real news.
 */
  public async getMonitoredNewsAccountList() {
    // Retrieve user ids of accounts we are following for their news
    const targetAuthorAccounts = await xAccountsService().getXAccountsFromScreenNames(this.bot, BotConfig.NewsSummaryBot.News.XSourceAccounts)
    const targetAuthorIds = targetAuthorAccounts.map(a => a.userId);

    return {
      targetAccountNames: BotConfig.NewsSummaryBot.News.XSourceAccounts,
      targetAuthorAccounts,
      targetAuthorIds
    }
  }
}