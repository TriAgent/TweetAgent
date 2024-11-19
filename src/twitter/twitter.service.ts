import { Injectable, Logger } from "@nestjs/common";
import * as moment from "Moment";
import { Moment } from "moment";
import { splitStringAtWord } from "src/utils/strings";
import { ApiResponseError, SendTweetV2Params, TweetV2, UserV2 } from "twitter-api-v2";
import { TwitterAuthService } from "./twitter-auth.service";

@Injectable()
export class TwitterService {
  private logger = new Logger(TwitterService.name);

  constructor(private auth: TwitterAuthService) { }

  /**
   * - Pagination is not used, only call once
   * 
   * @param accounts twitter accounts without trailing @
   */
  public async fetchAuthorsPosts(accounts: string[], notBefore: Moment): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot();

    // X API limitation: make sure start time is not older than a week ago
    const aWeekAgo = moment().subtract(7, "days");
    if (notBefore.isBefore(aWeekAgo)) {
      notBefore = aWeekAgo;
      this.logger.warn(`Not before date ${notBefore} is too old, changed to ${aWeekAgo}`);
    }

    // Only retrieve posts from the target accounts
    const query = accounts.map(u => `from:${u}`).join(" OR ");

    try {
      const pagination = await client.v2.search({
        query,
        sort_order: "recency",
        max_results: 10,
        start_time: notBefore.toISOString(),
        'tweet.fields': 'created_at,author_id,text', // public_metrics to get like/rt counts
      });

      return pagination?.tweets;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch authors posts", e);
    }
  }

  // public async fetchSelfMentions(notBefore: Moment): Promise<TweetV2[]> {
  //   const client = await this.auth.getAuthorizedClientForBot();
  //   const botAccount = await this.auth.getAuthenticatedBotAccount();

  //   try {
  //     const pagination = await client.v2.userMentionTimeline(botAccount.userId, {
  //       //sort_order: "recency",
  //       max_results: 5,
  //       start_time: notBefore.toISOString(),
  //       'tweet.fields': 'created_at,author_id,text'
  //     });

  //     return pagination?.tweets;
  //   }
  //   catch (e) {
  //     this.logger.error(`Fetch mentions error`);
  //     this.logger.error(String(e));
  //     console.log(e)

  //     if (e instanceof ApiResponseError)
  //       this.logger.error(e.errors);

  //     return null;
  //   }
  // }

  /**
   * Sends the given text as a tweet to the current bot X account.
   * Returns the created post ids (in conversation order)
   */
  public async publishTweet(tweetContent: string, inReplyToTweetId?: string): Promise<{ postId: string, text: string }[]> {
    const client = await this.auth.getAuthorizedClientForBot();

    // Split content if larger than 280 chars
    const subTweets: SendTweetV2Params[] = [];
    let remainingContent = tweetContent;
    while (remainingContent.length >= 280) {
      const parts = splitStringAtWord(remainingContent, 280 - 3); // -3 as we want space to ellipsis (...).
      remainingContent = parts[1];
      subTweets.push({
        text: `${parts[0]}...`
      });
    }

    subTweets.push({ text: remainingContent });

    // Attach to an existing tweet if we are writing a reply
    if (inReplyToTweetId) {
      subTweets[0].reply = {
        in_reply_to_tweet_id: inReplyToTweetId
      }
    }

    console.log("subTweets", subTweets)

    try {
      const createdTweets = await client.v2.tweetThread(subTweets);

      this.logger.log('Posted a new tweet thread:');
      this.logger.log(createdTweets);

      return createdTweets?.map(t => ({ postId: t.data.id, text: t.data.text }));
    }
    catch (e) {
      return this.handleTwitterApiError("Publish tweet", e);
    }
  }

  public async fetchPostsMentionningOurAccount(notBefore: Moment): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot();
    const botAuth = await this.auth.getAuthenticatedBotAccount();

    // X API limitation: make sure start time is not older than a week ago
    const aWeekAgo = moment().subtract(7, "days");
    if (notBefore.isBefore(aWeekAgo)) {
      notBefore = aWeekAgo;
      this.logger.warn(`Not before date ${notBefore} is too old, changed to ${aWeekAgo}`);
    }

    try {
      const replies = await client.v2.search(`to: ${botAuth.userId}`, {
        //sort_order: "relevancy",
        start_time: notBefore.toISOString(),
        'tweet.fields': 'created_at,id,author_id,text,conversation_id,referenced_tweets,public_metrics'
      });

      return replies?.tweets;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch mentionning posts", e);
    }
  }

  public async fetchAccountByUserName(userScreenName: string): Promise<UserV2> {
    const client = await this.auth.getAuthorizedClientForBot();

    const result = await client.v2.userByUsername(userScreenName);
    if (result.errors) {
      this.logger.error("fetchAccountByUserName");
      this.logger.error(result.errors);
      return null;
    }

    return result.data;
  }

  private handleTwitterApiError(context: string, e: Error) {
    this.logger.error(`${context} error`);
    this.logger.error(e);

    if (e instanceof ApiResponseError) {
      e.errors && this.logger.error(e.errors);
      e.data && this.logger.error(e.data);
    }

    return null;
  }
}