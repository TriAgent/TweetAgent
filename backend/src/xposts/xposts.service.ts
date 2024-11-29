import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Bot as DBBot, XPost } from '@prisma/client';
import { XPostCreationDTO } from '@x-ai-wallet-bot/common';
import moment from 'moment';
import { BotsService } from 'src/bots/bots.service';
import { Bot } from 'src/bots/model/bot';
import { BotConfig } from 'src/config/bot-config';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwitterService } from 'src/twitter/twitter.service';
import { XAccountsService } from 'src/xaccounts/xaccounts.service';
import { TweetV2 } from 'twitter-api-v2';
import { v4 as uuidV4 } from "uuid";
import { ConversationTree } from './model/conversation-tree';
import { PostStats } from './model/post-stats';

/**
 * Service that provides generic features for X (twitter) posts management.
 * Higher level than the lower level twitter fetch/post API but still independant from
 * specialized bots content.
 */
@Injectable()
export class XPostsService {
  private logger = new AppLogger("XPosts");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService,
    private xAccounts: XAccountsService,
    @Inject(forwardRef(() => BotsService)) private botsService: BotsService
  ) { }

  /**
   * From a child post, retrieves all XPosts that belong to a conversation.
   * A conversation is a list of ordered posts from the root post (no parent) to the current post id.
   * 
   * @param childPostId Post ID on X.
   */
  public async getParentConversation(bot: Bot, childPostId: string): Promise<XPost[]> {
    const conversation: XPost[] = [];

    let currentPostId: string = childPostId;
    while (currentPostId != null) {
      const xPost = await this.prisma.xPost.findFirst({
        where: {
          botId: bot.id,
          postId: currentPostId
        }
      });
      if (!xPost) {
        this.logger.warn(`Could not re-create the whole conversation for twitter post id ${childPostId}. Have all post's parents been fetched well by the fetcher?`);
        return null;
      }

      // Insert at array start
      conversation.splice(0, 0, xPost);

      currentPostId = xPost.parentPostId;
    }

    return conversation;
  }

  /**
   * From the given root post, recursively retrieves child posts and their descendants (database only).
   */
  public async getConversationTree(bot: Bot, post: XPost) {
    const tree = new ConversationTree(post);

    // Get child posts
    const childrenPosts = await this.prisma.xPost.findMany({
      where: {
        botId: bot.id,
        parentPostId: post.postId
      }
    });

    for (const child of childrenPosts) {
      tree.children.push(await this.getConversationTree(bot, child));
    }

    return tree;
  }

  public getXPostByTwitterPostId(bot: DBBot, twitterPostId: string): Promise<XPost> {
    return this.prisma.xPost.findUnique({
      where: {
        botId_postId: {
          botId: bot.id,
          postId: twitterPostId
        }
      },
      include: { xAccount: true }
    });
  }

  /**
   * Sends a queued post in database, that has not been puslished to twitter yet.
   * In case the original post text is too long, the post is split into sub-tweets and
   * therefore also into sub-posts on our end.
   */
  public async sendPendingXPosts() {
    // Make sure we haven't published too recently
    const mostRecentlyPublishedPost = await this.prisma.xPost.findFirst({
      where: {
        publishRequestAt: { not: null },
        AND: [
          { publishedAt: { not: null } },
          // TODO: replace code below with a "publish not before date" field in database, to be more generic
          { publishedAt: { gt: moment().subtract(2, "minutes").toDate() } }
        ]
      },
      orderBy: { publishedAt: "desc" }
    });

    if (mostRecentlyPublishedPost)
      return;

    // Find a tweet that we can send.
    const postToSend = await this.prisma.xPost.findFirst({
      where: {
        publishRequestAt: { not: null },
        publishedAt: null,
        isSimulated: false // Don't try publish simulated/test posts to X, this stays in local DB
      }
    });

    // Nothing new to send for now
    if (!postToSend)
      return;

    if (BotConfig.X.PublishPosts) {
      this.logger.log(`Sending tweet for queued db posted post id ${postToSend.id}`);
      const bot = this.botsService.getBotById(postToSend.botId);
      const createdTweets = await this.twitter.publishTweet(bot, postToSend.text, postToSend.parentPostId, postToSend.quotedPostId);

      const botXAccount = await this.xAccounts.ensureXAccount(bot, bot.dbBot.twitterUserId);

      // Mark as sent and create additional DB posts if the tweet has been split while publishing (because of X post character limitation)
      if (createdTweets && createdTweets.length > 0) {
        const rootTweet = createdTweets[0];
        await this.prisma.xPost.update({
          where: { id: postToSend.id },
          data: {
            bot: { connect: { id: bot.dbBot.id } },
            text: rootTweet.text, // Original post request has possibly been truncated by twitter so we keep what was really published for this post chunk
            postId: rootTweet.postId,
            publishedAt: new Date(),
            xAccount: { connect: { userId: botXAccount.userId } },
            wasReplyHandled: true // directly mark has handled post, as this is our own post
          }
        });

        // Create child xPosts if needed
        let parentPostId = rootTweet.postId;
        for (var tweet of createdTweets.slice(1)) {
          await this.prisma.xPost.create({
            data: {
              bot: { connect: { id: bot.dbBot.id } },
              publishedAt: new Date(),
              xAccount: { connect: { userId: botXAccount.userId } },
              text: tweet.text,
              postId: tweet.postId,
              parentPostId: parentPostId,
              wasReplyHandled: true, // directly mark has handled post, as this is our own post
              isSimulated: postToSend.isSimulated
            }
          });

          parentPostId = tweet.postId;
        }
      }
    }
    else {
      this.logger.warn(`Not publishing pending X post, disabled by configuration`);
    }
  }

  public async markAsReplied(xPost: XPost) {
    await this.prisma.xPost.update({
      where: { id: xPost.id },
      data: { wasReplyHandled: true }
    });
  }

  /**
   * Fetches every post not yet in database from twitter api, and saves it to database.
   * API is not called for posts we already know.
   */
  public async fetchAndSaveXPosts(bot: Bot, fetcher: () => Promise<TweetV2[]>): Promise<XPost[]> {
    const posts = await fetcher();

    if (posts) {
      this.logger.log(`Got ${posts.length} posts from twitter api`);

      // Store every post that we don't have yet
      const newPosts: XPost[] = [];
      for (var post of posts) {
        const existingPost = await this.getXPostByTwitterPostId(bot.dbBot, post.id);
        if (!existingPost) {
          this.logger.log('Created database xpost for external X tweetv2:');
          this.logger.log(post);

          const parentPostId = post.referenced_tweets?.find(t => t.type === "replied_to")?.id;
          const quotedPostId = post.referenced_tweets?.find(t => t.type === "quoted")?.id;

          const xAccount = await this.xAccounts.ensureXAccount(bot, post.author_id);

          // Save post to database
          const dbPost = await this.prisma.xPost.create({
            data: {
              bot: { connect: { id: bot.dbBot.id } },
              text: post.text,
              xAccount: { connect: { userId: xAccount.userId } },
              postId: post.id,
              publishedAt: post.created_at,
              parentPostId,
              quotedPostId,
              isSimulated: false // coming from X api
            }
          });
          newPosts.push(dbPost);
        }
      }

      return newPosts;
    }

    return null;
  }

  public async getLatestPostStats(bot: Bot, postId: string): Promise<PostStats> {
    const postLatest = await this.twitter.fetchSinglePost(bot, postId);

    return {
      impressionCount: postLatest.public_metrics.impression_count,
      likeCount: postLatest.public_metrics.like_count,
      rtCount: postLatest.public_metrics.quote_count + postLatest.public_metrics.retweet_count,
      commentCount: postLatest.public_metrics.reply_count
    }
  }

  /**
   * @param rootPostId the XPost database id, not twitter id
   */
  public async getChildrenPosts(bot: DBBot, rootPostId?: string): Promise<{ root?: XPost, posts: XPost[] }> {
    let root: XPost;
    if (rootPostId) {
      root = await this.prisma.xPost.findFirst({
        where: {
          id: rootPostId
        },
        include: { xAccount: true }
      });
    }

    let posts: XPost[] = [];
    if (!root || root.publishedAt) {
      // Only fetch child posts if the root post has been published or if no root post
      posts = await this.prisma.xPost.findMany({
        where: {
          botId: bot.id,
          parentPostId: root ? root.postId : null // If no root, we must force NO parent
        },
        include: { xAccount: true },
        orderBy: { publishedAt: "desc" }
      });
    }

    return { root, posts };
  }

  /**
   * Manually creates a post (simulated). Helps to test more use cases without depending 
   * on twitter posts/fetches.
   */
  public createManualPost(bot: DBBot, postCreationInput: XPostCreationDTO): Promise<XPost> {
    return this.prisma.xPost.create({
      data: {
        bot: { connect: { id: bot.id } },
        publishedAt: new Date(), // Considered as published
        xAccount: { connect: { userId: postCreationInput.xAccountUserId } },
        text: postCreationInput.text,
        postId: `simulated-${uuidV4()}`,
        isSimulated: true,
        ...(postCreationInput.parentPostId && { parentPostId: postCreationInput.parentPostId }),
        ...(postCreationInput.quotedPostId && { quotedPostId: postCreationInput.quotedPostId }),
      },
      include: {
        xAccount: true
      }
    });
  }
}
