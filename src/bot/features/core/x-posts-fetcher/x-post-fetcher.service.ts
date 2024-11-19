import { Injectable, Logger } from '@nestjs/common';
import { OperationHistoryType } from '@prisma/client';
import * as moment from 'moment';
import { BotConfig } from 'src/config/bot-config';
import { OperationHistoryService } from 'src/operation-history/operation-history.service';
import { TwitterService } from 'src/twitter/twitter.service';
import { XPostsService } from 'src/xposts/xposts.service';
import { BotFeature } from '../../../model/bot-feature';

const FetchXTargetAccountPostsDelaySec = 1 * 60; // Don't call the api more than once every N minutes
const FetchXMentionPostsDelaySec = 1 * 60;

/**
 * Service shared by all bot features to ensure required posts are fetched without duplicate requests,
 * as the number of posts we can read has a quota.
 */
@Injectable()
export class XPostFetcherService extends BotFeature {
  private logger = new Logger("XPostFetcher");

  constructor(
    private operations: OperationHistoryService,
    private xPosts: XPostsService,
    private twitter: TwitterService
  ) {
    super(5);
  }

  public async scheduledExecution() {
    // Fetch posts from some targeted accounts
    await this.fetchLatestTargetAccountPosts();

    // Fetch posts we are mentionned in
    await this.fetchLatestMentionPosts();
  }

  private async fetchLatestTargetAccountPosts() {
    const targetTwitterAccounts = BotConfig.NewsSummaryBot.News.XSourceAccounts;

    // Check when we last fetched - fetch max 12 hours ago if no previous history
    let latestFetchDate = await this.operations.mostRecentOperationDate(OperationHistoryType.FetchAccountsPosts, 12 * 60);
    if (moment().diff(latestFetchDate, "seconds") < FetchXTargetAccountPostsDelaySec)
      return;

    const posts = await this.xPosts.fetchAndSaveXPosts(() => {
      // Fetch recent posts, not earlier than last time we checked
      this.logger.log(`Fetching recent target accounts X posts not earlier than ${latestFetchDate}`);
      return this.twitter.fetchAuthorsPosts(targetTwitterAccounts, moment(latestFetchDate));
    });

    if (posts != null) {
      // Remember last fetch time
      await this.operations.saveRecentOperation(OperationHistoryType.FetchAccountsPosts);
    }
  }

  private async fetchLatestMentionPosts() {
    // Check when we last fetched
    let latestFetchDate = await this.operations.mostRecentOperationDate(OperationHistoryType.FetchPostsWeAreMentionnedIn, 12 * 60);
    if (moment().diff(latestFetchDate, "seconds") < FetchXMentionPostsDelaySec)
      return;

    const posts = await this.xPosts.fetchAndSaveXPosts(() => {
      // Fetch recent posts, not earlier than last time we checked
      this.logger.log(`Fetching recent X posts we are mentionned in, not earlier than ${latestFetchDate}`);
      return this.twitter.fetchPostsMentionningOurAccount(moment(latestFetchDate));
    });

    if (posts != null) {
      console.log("new mention posts", posts)

      // Remember last fetch time
      await this.operations.saveRecentOperation(OperationHistoryType.FetchPostsWeAreMentionnedIn);
    }
  }
}