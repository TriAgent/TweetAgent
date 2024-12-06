import { ContestAirdrop, ContestAirdropTargetUser, XAccount, XPost } from "@prisma/client";
import { BotFeatureGroupType, BotFeatureType } from "@x-ai-wallet-bot/common";
import moment from "moment";
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { Bot } from "src/bots/model/bot";
import { BotConfig } from "src/config/bot-config";
import { AppLogger } from "src/logs/app-logger";
import { prisma, xPostsService } from "src/services";
import { PostStats } from "src/xposts/model/post-stats";
import { z, infer as zodInfer } from "zod";

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  snapshotInterval: z.number().describe('Delay (seconds) between 2 airdrop snapshots'),
  gatherStatsInterval: z.number().describe('Delay (seconds) after which we gather our quote post stats to how to split airdrop tokens'),
  sendOnChain: z.boolean().describe('Whether to really send tokens on chain, or to keep this airdrop as a local simulation')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class AirdropSnapshotProvider extends BotFeatureProvider<AirdropSnapshotFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.AirdropContest,
      BotFeatureType.AirdropContest_AirdropSnapshot,
      `Snapshots`,
      `Dispatches airdrop tokens to authors of best 'for contest' posts, at regular intervals, but without transfering them yet`,
      FeatureConfigFormat,
      (bot: Bot) => new AirdropSnapshotFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: true,
      snapshotInterval: 24 * 60 * 60, // 1 per day
      gatherStatsInterval: 7 * 24 * 60 * 60, // check results after 7 days
      sendOnChain: false
    }
  }
}

/**
 * This feature regularly snapshots the recent posts that were elected for the airdrop contest (RTed a few
 * days ago) and dispatches tokens to those post authors proportionally to their stats.
 * 
 * Scheduled airdrops are then sent by the airdrop sender feature.
 */
export class AirdropSnapshotFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("AirdropSnapshot", this.bot);

  constructor(provider: AirdropSnapshotProvider, bot: Bot) {
    super(provider, bot, 10);
  }

  async scheduledExecution() {
    // No twitter account bound
    if (!this.bot.dbBot.twitterUserId)
      return;

    // Ensure most recent airdrop is more than X time ago
    const minSecondsSinceLastSnapshot = this.config.snapshotInterval;
    const mostRecentAirdrop = await prisma().contestAirdrop.findFirst({ orderBy: { createdAt: "desc" } });
    if (mostRecentAirdrop && moment().diff(mostRecentAirdrop.createdAt, "seconds") < minSecondsSinceLastSnapshot)
      return;

    // Get the list of contest posts (quote posts, not quoted) posted between 7 and 8 days ago
    const eligibleEndDate = moment().subtract(this.config.gatherStatsInterval, "seconds");
    const eligibleStartate = eligibleEndDate.clone().subtract(minSecondsSinceLastSnapshot, "seconds");
    const eligiblePosts = await prisma().xPost.findMany({
      where: {
        botId: this.bot.id,
        xAccountUserId: this.bot.dbBot.twitterUserId!, // Published by us
        contestQuotedPost: {
          worthForAirdropContest: true // took part in the airdrop contest
        },
        postAirdrops: { none: {} }, // Not yet in an airdrop
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
      let stats: PostStats;

      if (!eligiblePost.isSimulated)
        stats = await xPostsService().getLatestPostStats(this.bot, eligiblePost.postId!);
      else {
        // If post is simulated, use arbitrary stats
        stats = {
          impressionCount: 30,
          likeCount: 5,
          commentCount: 2,
          rtCount: 3
        };
      }

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
    const airdrop = await prisma().contestAirdrop.create({
      data: {
        totalTokenAmount: BotConfig.AirdropContest.TokenAmountPerAirdrop,
        chain: BotConfig.AirdropContest.Chain.id,
        tokenAddress: BotConfig.AirdropContest.Token.address,
        evaluatedPostsCount: eligiblePosts.length,
        bot: { connect: { id: this.bot.id } }
      }
    });

    let distributedTokens = 0;
    let airdroppedPostCount = 0; // Number of posts that really got tokens (have address)
    for (const postInfo of postsInfo) {
      // Address of the relevant contest post
      const winningAuthorAccount = postInfo.post.contestQuotedPost.xAccount;
      const authorAirdropAddress = winningAuthorAccount.airdropAddress;
      // Address of the user that mentioned our bot to make us notice the quoted post
      const winningMentionerAccount = postInfo.post.contestQuotedPost.contestMentioningPost?.xAccount;
      const mentionerAirdropAddress = winningMentionerAccount?.airdropAddress;

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

      if (authorAirdropAddress && tokensForAuthor)
        await this.createPostAirdrop(airdrop, postInfo, ContestAirdropTargetUser.Author, authorAirdropAddress, tokensForAuthor, winningAuthorAccount);

      if (tokensForMentioner)
        await this.createPostAirdrop(airdrop, postInfo, ContestAirdropTargetUser.Mentioner, mentionerAirdropAddress, tokensForMentioner, winningMentionerAccount);

      distributedTokens += tokensForAuthor + tokensForMentioner;
      airdroppedPostCount++;
    }

    this.logger.log(`Distributed ${distributedTokens} tokens for ${airdroppedPostCount} posts.`);
  }

  private async createPostAirdrop(airdrop: ContestAirdrop, postInfo: PostInfo, targetUser: ContestAirdropTargetUser, airdropAddress: string, tokenAmount: number, winningAccount: XAccount) {
    await prisma().postContestAirdrop.create({
      data: {
        airdrop: { connect: { id: airdrop.id } },
        quotePost: { connect: { id: postInfo.post.id } },
        winningXAccount: { connect: { userId: winningAccount.userId } },

        targetUser,
        airdropAddress,
        tokenAmount: tokenAmount,
        weight: postInfo.weight,

        shouldSendOnChain: this.config.sendOnChain,

        // Stats
        impressionCount: postInfo.stats.impressionCount,
        commentCount: postInfo.stats.commentCount,
        likeCount: postInfo.stats.likeCount,
        rtCount: postInfo.stats.rtCount
      }
    });
  }
}

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