import { Injectable, Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import * as moment from "moment";
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";
import { PostStats } from "src/xposts/model/post-stats";
import { XPostsService } from "src/xposts/xposts.service";

type PostInfo = {
  post: XPost;
  stats: PostStats;
  score: number; // score based on stats, independant from other posts
  weight: number; // weight of this post's score relative to other posts scores (0-1)
  tokens: number; // number of tokens related to weight
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
        publisherAccountUserId: { not: null }, // Published by us
        contestQuotedPost: {
          worthForAirdropContest: true // took part in the airdrop contest
        },
        ContestAirdropPost: { none: {} }, // Not yet in an airdrop
        AND: [
          { publishedAt: { gte: eligibleStartate.toDate() } },
          { publishedAt: { lt: eligibleEndDate.toDate() } }
        ]
      }
    });

    // Gather stats for all eligible posts (force fetch twitter api)
    const postsInfo: PostInfo[] = [];
    for (const eligiblePost of eligiblePosts) {
      const stats = await this.xPosts.getLatestPostStats(eligiblePost.postId);
      postsInfo.push({
        post: eligiblePost,
        stats, weight: 0, score: 0, tokens: 0
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
      postInfo.tokens = BotConfig.AirdropContest.TokenAmountPerAirdrop / postInfo.weight;
    }

    // Create database entries
    const airdrop = await this.prisma.contestAirdrop.create({
      data: {
        totalTokenAmount: BotConfig.AirdropContest.TokenAmountPerAirdrop,
        token: BotConfig.AirdropContest.AirdroppedTokenName,
        chain: BotConfig.AirdropContest.AirdroppedTokenChain,
      }
    });

    for (const postInfo of postsInfo) {
      const postAirdrop = await this.prisma.postContestAirdrop.create({
        data: {
          airdrop: { connect: { id: airdrop.id } },
          quotePost: { connect: { id: postInfo.post.id } },
          winningXAccount: ,

          airdropAddress: ,
          tokenAmount:,
          weight:,
          // Stats
          impressionCount:,
          commentCount:,
          likeCount:,
          rtCount:
        }
      });
    }
  }
}