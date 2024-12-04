import { XAccount } from "./x-account";
import { XPost } from "./x-post";

/**
 * One entry every time we make a snapshot of the best recent posts and dispatch airdrop tokens to holders.
 */
export type ContestAirdrop = {
  id: string;
  createdAt: string;
  transferedAt?: string; // Date at which the chain token transfer has been completed

  totalTokenAmount: string; // Total number of tokens distributed (human readable format)
  chain: string; // eg: base_sepolia_testnet
  tokenAddress: string; // eg: USDT contract address on base

  // Internal stats
  evaluatedPostsCount: number; // Number of quote posts considered for this airdrop distribution

  postAirdrops: PostContestAirdrop[];
}

enum ContestAirdropTargetUser {
  Author = 'Author',
  Mentioner = 'Mentioner'
}

// One entry per receiving post per airdrop
export type PostContestAirdrop = {
  id: string;
  createdAt: string;

  airdrop: ContestAirdrop;
  contestAirdropId: string;

  winningXAccount: XAccount;
  winningXAccountUserId: string;

  airdropAddress: string; // Blockchain address used for the airdrop
  tokenAmount: number; // Same token as in the ContestAirdrop entry, human readable amount

  quotePost: XPost; // Our quoted Post that RTed user's post
  quotePostId: string;

  targetUser: ContestAirdropTargetUser; // Which user is receiving the airdrop for this post? As both author and mentioner can get some

  transactionId?: string;// Chain transaction ID
  transferedAt?: string; // Date at which the chain token transfer has been completed

  // Post stats at the time of snapshot
  commentCount: number;
  likeCount: number;
  rtCount: number;
  impressionCount: number;

  weight: number; // Weight of this post among other posts of the same airdrop
}
