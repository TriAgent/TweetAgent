import { BotFeatureType, OperationHistoryType } from '@prisma/client';
import moment from 'moment';
import { Bot } from 'src/bots/model/bot';
import { BotConfig } from 'src/config/bot-config';
import { AppLogger } from 'src/logs/app-logger';
import { operationHistoryService, twitterService, xPostsService } from 'src/services';
import { TweetV2 } from 'twitter-api-v2';
import { BotFeature } from '../../../model/bot-feature';

const FetchXTargetAccountPostsDelaySec = 1 * 60; // Don't call the api more than once every N minutes
const FetchXMentionPostsDelaySec = 1 * 60;

/**
 * Service shared by all bot features to ensure required posts are fetched without duplicate requests,
 * as the number of posts we can read has a quota.
 */
export class XPostFetcherFeature extends BotFeature {
  private logger = new AppLogger("XPostFetcher", this.bot);

  constructor(bot: Bot) {
    super(BotFeatureType.Core_XPostsFetcher, bot, 5);
  }

  public async scheduledExecution() {
    // Fetch posts from some targeted accounts
    await this.fetchLatestTargetAccountPosts();

    // Fetch posts we are mentioned in
    await this.fetchLatestMentionPosts();
  }

  private async fetchLatestTargetAccountPosts() {
    const targetTwitterAccounts = BotConfig.NewsSummaryBot.News.XSourceAccounts;

    // Check when we last fetched - fetch max 12 hours ago if no previous history
    let latestFetchDate = await operationHistoryService().mostRecentOperationDate(OperationHistoryType.FetchAccountsPosts, 12 * 60);
    if (moment().diff(latestFetchDate, "seconds") < FetchXTargetAccountPostsDelaySec)
      return;

    const posts = await xPostsService().fetchAndSaveXPosts(this.bot, () => {
      // Fetch recent posts, not earlier than last time we checked
      this.logger.log(`Fetching recent target accounts X posts not earlier than ${latestFetchDate}`);
      // subtract 1 minute to compensate twitter's api lag after a post is published
      return twitterService().fetchAuthorsPosts(this.bot, targetTwitterAccounts, moment(latestFetchDate).subtract(1, "minutes"));
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
    const posts = await xPostsService().fetchAndSaveXPosts(this.bot, () => {
      this.logger.log(`Fetching recent X posts we are mentioned in, not earlier than ${latestFetchDate}`);
      // subtract 1 minute to compensate twitter's api lag after a post is published
      return twitterService().fetchPostsMentioningOurAccount(this.bot, moment(latestFetchDate).subtract(1, "minutes"));
    });

    if (!posts)
      return;

    // For each post we get mentioned in, fetch and save the whole conversation before it (parent posts).
    // This is needed for example by the contest service to study the root post vs the mentioned post (possibly in replies).
    for (const post of posts) {
      await xPostsService().fetchAndSaveXPosts(this.bot, async () => {
        const fetchedPosts: TweetV2[] = [];
        if (post.quotedPostId) {
          this.logger.log(`Fetching quoted post for mentioning post`);
          fetchedPosts.push(await twitterService().fetchSinglePost(this.bot, post.quotedPostId));
        }

        this.logger.log(`Fetching parent conversation for mentioning post`);
        fetchedPosts.push(...(await twitterService().fetchParentPosts(this.bot, post.postId)));

        return fetchedPosts;
      });
    }

    if (posts != null) {
      // Remember last fetch time
      await operationHistoryService().saveRecentOperation(OperationHistoryType.FetchPostsWeAreMentionnedIn);
    }
  }
}