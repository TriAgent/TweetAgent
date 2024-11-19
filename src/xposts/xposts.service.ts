import { Injectable, Logger } from '@nestjs/common';
import { XPost } from '@prisma/client';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwitterService } from 'src/twitter/twitter.service';
import { TweetV2 } from 'twitter-api-v2';

/**
 * Service that provides generic features for X (twitter) posts management.
 * Higher level than the lower level twitter fetch/post API but still independant from
 * specialized bots content.
 */
@Injectable()
export class XPostsService {
  private logger = new Logger("XPosts");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService
  ) { }

  /**
   * From a child post, retrieves all XPosts that belog to a conversation.
   * A conversation is a list of ordered posts from the root post (no parent) to the current post id
   * 
   * @param childPostId Post ID on X.
   */
  public async getConversation(childPostId: string): Promise<XPost[]> {
    const conversation: XPost[] = [];

    let currentPostId: string = childPostId;
    while (currentPostId != null) {

      const xPost = await this.prisma.xPost.findFirst({ where: { postId: currentPostId } });
      if (!xPost) {
        this.logger.warn(`Could not re-create the whole conversation for twitter post id ${childPostId}`);
        return null;
      }

      // Insert at array start
      conversation.splice(0, 0, xPost);

      currentPostId = xPost.parentPostId;
    }

    return conversation;
  }

  public getXPostByTwitterPostId(twitterPostId: string): Promise<XPost> {
    return this.prisma.xPost.findFirst({ where: { postId: twitterPostId } });
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
        publishedAt: null
      }
    });

    // Nothing new to send for now
    if (!postToSend)
      return;

    this.logger.log(`Sending tweet for queued db posted post id ${postToSend.id}`);
    const createdTweets = await this.twitter.publishTweet(postToSend.text, postToSend.parentPostId);

    // Mark as sent and create additional DB posts if the tweet has been split while publishing (because of X post character limitation)
    if (createdTweets && createdTweets.length > 0) {
      const rootTweet = createdTweets[0];
      await this.prisma.xPost.update({
        where: { id: postToSend.id },
        data: {
          text: rootTweet.text, // Original post request has possibly been truncated by twitter so we keep what was really published for this post chunk
          postId: rootTweet.postId,
          rootPostId: postToSend.rootPostId || rootTweet.postId, // Self root if we are not writing a reply. Or use root defined at creation if this is a reply
          publishedAt: new Date()
        }
      });

      // Create child xPosts if needed
      let parentPostId = rootTweet.postId;
      for (var tweet of createdTweets.slice(1)) {
        await this.prisma.xPost.create({
          data: {
            publishedAt: new Date(),
            authorId: postToSend.authorId,
            text: tweet.text,
            postId: tweet.postId,
            parentPostId: parentPostId,
            rootPostId: rootTweet.postId,
            publisherAccountUserId: postToSend.publisherAccountUserId
          }
        });

        parentPostId = tweet.postId;
      }
    }
  }

  public async markAsReplied(xPost: XPost) {
    await this.prisma.xPost.update({
      where: { id: xPost.id },
      data: { wasReplyHandled: true }
    });
  }

  public async fetchAndSaveXPosts(fetcher: () => Promise<TweetV2[]>): Promise<XPost[]> {
    const posts = await fetcher();

    if (posts) {
      this.logger.log(`Got ${posts.length} posts from twitter api`);

      // Store every post that we don't have yet
      const newPosts: XPost[] = [];
      for (var post of posts) {
        const existingPost = await this.getXPostByTwitterPostId(post.id);
        if (!existingPost) {
          const parentXPostId = post.referenced_tweets?.find(t => t.type === "replied_to")?.id;

          console.log("post.referenced_tweets", post.referenced_tweets)

          // Save post to database
          const dbPost = await this.prisma.xPost.create({
            data: {
              text: post.text,
              authorId: post.author_id,
              postId: post.id,
              publishedAt: post.created_at,
              parentPostId: parentXPostId ? parentXPostId : null,
              rootPostId: parentXPostId ? post.conversation_id : post.id
            }
          });
          newPosts.push(dbPost);
        }
      }

      return newPosts;
    }

    return null;
  }
}