import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";
import { PostStats } from "src/xposts/model/post-stats";
import { XPostWithAccount } from "src/xposts/model/xpost-with-account";
import { XPostsService } from "src/xposts/xposts.service";

type PostInfo = {
  post: XPostWithAccount;
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
        PostContestAirdrop: { none: {} }, // Not yet in an airdrop
        AND: [
          { publishedAt: { gte: eligibleStartate.toDate() } },
          { publishedAt: { lt: eligibleEndDate.toDate() } }
        ]
      },
      include: { xAccount: true }
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
      postInfo.tokenAmount = BotConfig.AirdropContest.TokenAmountPerAirdrop / postInfo.weight;
    }

    // Create database entries
    const airdrop = await this.prisma.contestAirdrop.create({
      data: {
        totalTokenAmount: BotConfig.AirdropContest.TokenAmountPerAirdrop,
        token: BotConfig.AirdropContest.AirdroppedTokenName,
        chain: BotConfig.AirdropContest.AirdroppedTokenChain,
        evaluatedPostsCount: eligiblePosts.length
      }
    });

    let distributedTokens = 0;
    let airdroppedPostCount = 0; // Number of posts that really got tokens (have address)
    for (const postInfo of postsInfo) {
      // If user did not provide his airdrop address, we just don't distribute his tokens for this airdrop.
      if (!postInfo.post.xAccount.airdropAddress) {
        this.logger.warn(`No airdrop address provided for quoted post ${postInfo.post.contestQuotedPostId}, no airdrop tokens sent`);
        continue;
      }

      this.logger.log(`Post airdrop:`);
      this.logger.log(`Content: ${postInfo.post.text}`);
      this.logger.log(`Stats: ${postInfo.tokenAmount} tokens for ${postInfo.stats.impressionCount} impressions, ${postInfo.stats.commentCount} comments, ${postInfo.stats.likeCount} likes and ${postInfo.stats.rtCount} RTs.`);

      await this.prisma.postContestAirdrop.create({
        data: {
          airdrop: { connect: { id: airdrop.id } },
          quotePost: { connect: { id: postInfo.post.id } },
          winningXAccount: { connect: { userId: postInfo.post.xAccountUserId } },

          airdropAddress: postInfo.post.xAccount.airdropAddress,
          tokenAmount: postInfo.tokenAmount,
          weight: postInfo.weight,

          // Stats
          impressionCount: postInfo.stats.impressionCount,
          commentCount: postInfo.stats.commentCount,
          likeCount: postInfo.stats.likeCount,
          rtCount: postInfo.stats.rtCount
        }
      });

      distributedTokens += postInfo.tokenAmount;
      airdroppedPostCount++;
    }

    this.logger.log(`Distributed ${distributedTokens} tokens for ${airdroppedPostCount} posts.`);
  }
}