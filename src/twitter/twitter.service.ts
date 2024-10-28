import { Injectable, Logger } from "@nestjs/common";
import { Moment } from "moment";
import { splitStringAtWord } from "src/utils/strings";
import { TweetV2 } from "twitter-api-v2";
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

    // Only retrieve posts from some target accounts
    const query = accounts.map(u => `from:${u}`).join(" OR ");

    // Fetch API
    const pagination = await client.v2.search({
      query,
      sort_order: "relevancy",
      max_results: 10,
      start_time: notBefore.toISOString(),
      'tweet.fields': 'created_at,author_id,text',
      //  /** ISO date string */
      //  end_time?: string;
      //  /** ISO date string */
      //  start_time?: string;
      //  max_results?: number;
      //  since_id?: string;
      //  until_id?: string;
      //  next_token?: string;
    });

    return pagination?.tweets;
  }

  /**
   * Sends the given text as a tweet to the current bot X account.
   * Returns the created post id (twitter post id)
   */
  public async publishTweet(tweetContent: string): Promise<string> {
    const client = await this.auth.getAuthorizedClientForBot();

    // Split content if larger than 280 chars
    const subTweets: string[] = [];
    let remainingContent = tweetContent;
    while (remainingContent.length >= 280) {
      const parts = splitStringAtWord(remainingContent, 280 - 3); // -3 as we want space to ellipsis (...).
      remainingContent = parts[1];
      subTweets.push(`${parts[0]}...`);
    }

    subTweets.push(remainingContent);

    const createdTweets = await client.v2.tweetThread(subTweets);

    this.logger.log('Posted a new tweet thread:');
    this.logger.log(createdTweets);

    return createdTweets?.[0].data.id; // Only return the parent tweet id for now
  }

  public async fetchRepliesToSelf(notBefore: Moment): Promise<TweetV2[]> {
    const client = await this.auth.getAuthorizedClientForBot();
    const botAuth = await this.auth.getAuthenticatedBotAccount();

    const replies = await client.v2.search(`to: ${botAuth.userId}`, {
      sort_order: "relevancy",
      start_time: notBefore.toISOString(),
      'tweet.fields': 'created_at,id,author_id,text,conversation_id,referenced_tweets'
    });

    return replies?.tweets;
  }
}