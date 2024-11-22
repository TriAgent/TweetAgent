import { Injectable, Logger } from "@nestjs/common";
import { ContestAirdrop, ContestAirdropTargetUser, XAccount, XPost } from "@prisma/client";
import * as moment from "moment";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";
import { PostStats } from "src/xposts/model/post-stats";
import { XPostsService } from "src/xposts/xposts.service";

type PostInfo = {
  post: XPost & {
    contestQuotedPost: XPost & {
      xAccount: XAccount;
      contestMentioningPost: XPost & {
        xAccount: XAccount
      }
    }
  };
  stats: PostStats;
  score: number; // score based on stats, independant from other posts
  weight: number; // weight of this post's score relative to other posts scores (0-1)
  tokenAmount: number; // number of tokens related to weight
}

/**
 * This feature regularly snapshots the recent posts that were elected for the airdrop contest (RTed a few
 * days ago) and dispatches tokens to those post authors proportionally to their stats.
 * 
 * Scheduled airdrops are then sent by the airdrop sender feature.
 */
@Injectable()
export class AirdropSnapshotService extends BotFeature {
  private logger = new Logger("AirdropSnapshot");

  constructor(
    private prisma: PrismaService,
    private xPosts: XPostsService
  ) {
    super(10);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // Ensure most recent airdrop is more than 24h ago
    const mostRecentAirdrop = await this.prisma.contestAirdrop.findFirst({ orderBy: { createdAt: "desc" } });
    if (mostRecentAirdrop && moment().diff(mostRecentAirdrop.createdAt, "hours") < BotConfig.AirdropContest.MinHoursBetweenAirdrops)
      return;

    // Get the list of contest posts (quote posts, not quoted) posted between 7 and 8 days ago
    const eligibleEndDate = moment().subtract(BotConfig.AirdropContest.DaysBeforeStatCollection, "days");
    const eligibleStartate = eligibleEndDate.clone().subtract(BotConfig.AirdropContest.MinHoursBetweenAirdrops, "hours");
    const eligiblePosts = await this.prisma.xPost.findMany({
      where: {
        botAccountUserId: { not: null }, // Published by us
        contestQuotedPost: {
          worthForAirdropContest: true // took part in the airdrop contest
        },
        PostContestAirdrop: null, // Not yet in an airdrop
        AND: [
          { publishedAt: { gte: eligibleStartate.toDate() } },
          { publishedAt: { lt: eligibleEndDate.toDate() } }
        ]
      },
      include: {
        contestQuotedPost: {
          include: {
            xAccount: true,
            contestMentioningPost: {
              include: {
                xAccount: true
              }
            }
          }
        }
      }
    });

    this.logger.log(`Starting to produce a new airdrop. Using ${eligiblePosts.length} posts. For posts published between ${eligibleStartate} and ${eligibleEndDate}.`);

    // Gather stats for all eligible posts (force fetch twitter api)
    const postsInfo: PostInfo[] = [];
    for (const eligiblePost of eligiblePosts) {
      const stats = await this.xPosts.getLatestPostStats(eligiblePost.postId);
      postsInfo.push({
        post: eligiblePost,
        stats, weight: 0, score: 0, tokenAmount: 0
      });
    }

    // Compute weight for each post based on its stats
    let scoreTotal = 0;
    for (const postInfo of postsInfo) {
      postInfo.score =
        postInfo.stats.rtCount * 10 +
        postInfo.stats.commentCount * 5 +
        postInfo.stats.likeCount * 5 +
        postInfo.stats.impressionCount;

      scoreTotal += postInfo.score;
    }

    // Compute weight and tokens for each airdropped post
    for (const postInfo of postsInfo) {
      postInfo.weight = scoreTotal > 0 ? postInfo.score / scoreTotal : 0;
      postInfo.tokenAmount = BotConfig.AirdropContest.TokenAmountPerAirdrop * postInfo.weight;
    }

    // Create database entries
    const airdrop = await this.prisma.contestAirdrop.create({
      data: {
        totalTokenAmount: BotConfig.AirdropContest.TokenAmountPerAirdrop,
        chain: BotConfig.AirdropContest.Chain.id,
        tokenAddress: BotConfig.AirdropContest.Token.address,
        evaluatedPostsCount: eligiblePosts.length
      }
    });

    let distributedTokens = 0;
    let airdroppedPostCount = 0; // Number of posts that really got tokens (have address)
    for (const postInfo of postsInfo) {
      // Address of the relevant contest post
      const authorAirdropAddress = postInfo.post.contestQuotedPost.xAccount.airdropAddress;
      // Address of the user that mentioned our bot to make us notice the quoted post
      const mentionerAirdropAddress = postInfo.post.contestQuotedPost.contestMentioningPost?.xAccount.airdropAddress;

      // If the mentioning user did not provide his airdrop address, we just don't distribute any token to him or to the quoted post owner.
      if (!mentionerAirdropAddress) {
        this.logger.warn(`No airdrop address (mentioning post) provided for quoted post ${postInfo.post.contestQuotedPostId}, no airdrop tokens sent`);
        continue;
      }

      let tokensForAuthor: number, tokensForMentioner: number;
      if (authorAirdropAddress) {
        // Quoted post has an airdrop address? split between author and mentioner.
        // NOTE: mentioner and author can be the same - in which case the same address receives 100% of tokens.
        tokensForAuthor = Math.floor(postInfo.tokenAmount / 2);
        tokensForMentioner = Math.floor(postInfo.tokenAmount / 2);
      }
      else {
        // Only mentioner has an address
        tokensForAuthor = 0;
        tokensForMentioner = postInfo.tokenAmount;
      }

      this.logger.log(`Post airdrop:`);
      this.logger.log(`Quote post content: ${postInfo.post.text}`);
      this.logger.log(`Stats: ${postInfo.tokenAmount} tokens for ${postInfo.stats.impressionCount} impressions, ${postInfo.stats.commentCount} comments, ${postInfo.stats.likeCount} likes and ${postInfo.stats.rtCount} RTs.`);
      authorAirdropAddress && this.logger.log(`Author gets ${tokensForAuthor} tokens at ${authorAirdropAddress}`);
      this.logger.log(`Mentioner gets ${tokensForMentioner} tokens at ${mentionerAirdropAddress}`);

      if (tokensForAuthor)
        await this.createPostAirdrop(airdrop, postInfo, ContestAirdropTargetUser.Author, authorAirdropAddress, tokensForAuthor);

      if (tokensForMentioner)
        await this.createPostAirdrop(airdrop, postInfo, ContestAirdropTargetUser.Mentioner, mentionerAirdropAddress, tokensForMentioner);

      distributedTokens += tokensForAuthor + tokensForMentioner;
      airdroppedPostCount++;
    }

    this.logger.log(`Distributed ${distributedTokens} tokens for ${airdroppedPostCount} posts.`);
  }

  private async createPostAirdrop(airdrop: ContestAirdrop, postInfo: PostInfo, targetUser: ContestAirdropTargetUser, airdropAddress: string, tokenAmount: number) {
    await this.prisma.postContestAirdrop.create({
      data: {
        airdrop: { connect: { id: airdrop.id } },
        quotePost: { connect: { id: postInfo.post.id } },
        winningXAccount: { connect: { userId: postInfo.post.xAccountUserId } },

        targetUser,
        airdropAddress,
        tokenAmount: tokenAmount,
        weight: postInfo.weight,

        // Stats
        impressionCount: postInfo.stats.impressionCount,
        commentCount: postInfo.stats.commentCount,
        likeCount: postInfo.stats.likeCount,
        rtCount: postInfo.stats.rtCount
      }
    });
  }
}