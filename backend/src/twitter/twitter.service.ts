import { forwardRef, Inject, Injectable } from "@nestjs/common";
import moment, { Moment } from "moment";
import { Bot } from "src/bots/model/bot";
import { AppLogger } from "src/logs/app-logger";
import { splitStringAtWord } from "src/utils/strings";
import { ApiResponseError, SendTweetV2Params, TweetV2, UserV2 } from "twitter-api-v2";
import { TwitterAuthService } from "./twitter-auth.service";

const TweetFields = `created_at,id,author_id,conversation_id,text,referenced_tweets,public_metrics`; // public_metrics to get like/rt counts

@Injectable()
export class TwitterService {
  private logger = new AppLogger("Twitter");

  constructor(
    @Inject(forwardRef(() => TwitterAuthService)) private auth: TwitterAuthService
  ) { }

  /**
   * - Pagination is not used, only call once
   * 
   * @param accounts twitter accounts without trailing @
   */
  public async fetchAuthorsPosts(bot: Bot, accounts: string[], notBefore: Moment): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

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
        'tweet.fields': TweetFields,
      });

      return pagination?.tweets;
    }
    catch (e) {
      console.error(e)
      return this.handleTwitterApiError("Fetch authors posts", e);
    }
  }

  public async fetchPostsMentioningOurAccount(bot: Bot, notBefore: Moment): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

    // X API limitation: make sure start time is not older than a week ago
    const aWeekAgo = moment().subtract(7, "days");
    if (notBefore.isBefore(aWeekAgo)) {
      notBefore = aWeekAgo;
      this.logger.warn(`Not before date ${notBefore} is too old, changed to ${aWeekAgo}`);
    }

    try {
      const replies = await client.v2.search(`@${bot.dbBot.twitterUserScreenName}`, {
        //sort_order: "relevancy",
        start_time: notBefore.toISOString(),
        'tweet.fields': TweetFields
      });

      return replies?.tweets;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch mentioning posts", e);
    }
  }

  /**
   * Publishes a quote to an existing tweet (RT with comment).
   * This throws an error in case the content cannot fit in 
   */
  public publishQuote(bot: Bot, tweetContent: string, quotedPostId: string): Promise<{ postId: string, text: string }[]> {
    return this.publishTweet(bot, tweetContent, undefined, quotedPostId);
  }

  /**
   * Sends the given text as a tweet to the current bot X account.
   * Returns the created post ids (in conversation order)
   */
  public async publishTweet(bot: Bot, tweetContent: string, inReplyToTweetId?: string, quoteTweetId?: string): Promise<{ postId: string, text: string }[]> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

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

    // Quote an existing tweet (RT with message)
    if (quoteTweetId)
      subTweets[0].quote_tweet_id = quoteTweetId;

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

  /**
   * Iteratively fetches parent posts (beginning of conversation) from the given post.
   */
  public async fetchParentPosts(bot: Bot, postId: string): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

    const conversation: any[] = [];

    let currentTweetId = postId;

    while (currentTweetId) {
      try {
        const tweet = await client.v2.singleTweet(currentTweetId, {
          expansions: ['referenced_tweets.id'],
          'tweet.fields': TweetFields,
        });

        if (!tweet.data) {
          this.logger.warn(`Failed to retrieve tweet with ID ${currentTweetId}. Possibly deleted.`);
          return null;
        }

        conversation.unshift(tweet.data);

        const referencedTweet = tweet.data.referenced_tweets?.find((ref) => ref.type === 'replied_to');

        currentTweetId = referencedTweet ? referencedTweet.id : null;
      }
      catch (e) {
        return this.handleTwitterApiError("Fetch parent posts", e);
      }
    }

    return conversation;
  }

  public async fetchSinglePost(bot: Bot, postId: string): Promise<TweetV2> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

    try {
      const result = await client.v2.singleTweet(postId, {
        'tweet.fields': TweetFields
      });

      return result?.data;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch single post", e);
    }
  }

  public async fetchAccountByUserId(bot: Bot, userId: string): Promise<UserV2> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

    try {
      const result = await client.v2.user(userId);
      if (result.errors) {
        this.logger.error("fetchAccountByUserId");
        this.logger.error(result.errors);
        return null;
      }

      return result.data;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch account by user id", e);
    }
  }

  public async fetchAccountByUserName(bot: Bot, userScreenName: string): Promise<UserV2> {
    const client = await this.auth.getAuthorizedClientForBot(bot);

    try {
      const result = await client.v2.userByUsername(userScreenName);
      if (result.errors) {
        this.logger.error("fetchAccountByUserName");
        this.logger.error(result.errors);
        return null;
      }

      return result.data;
    }
    catch (e) {
      return this.handleTwitterApiError("Fetch account by user name", e);
    }
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
}