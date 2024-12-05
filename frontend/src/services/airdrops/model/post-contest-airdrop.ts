import { XPost } from "@services/posts/model/x-post";
import type { PostContestAirdrop as PostContestAirdropDTO, XAccount } from "@x-ai-wallet-bot/common";
import { Expose, Type } from "class-transformer";

type RefactoredInterface = Omit<
  PostContestAirdropDTO, 
  "quotePost"| "createdAt"|"transferedAt"|"weight"|"airdrop"|
  "contestAirdropId"|"winningXAccountUserId"|"quotePostId"|"targetUser"
>;

export class PostContestAirdrop implements RefactoredInterface {
  @Expose() public id: string;
  @Expose() @Type(() => Date) public createdAt: Date;
  @Expose() @Type(() => XPost) public quotePost: XPost;
  @Expose() tokenAmount: number;
  @Expose() airdropAddress: string;

  @Expose() winningXAccount: XAccount;

  @Expose() targetUser: string; // Which user is receiving the airdrop for this post? As both author and mentioner can get some

  @Expose() shouldSendOnChain: boolean;
  @Expose() transactionId?: string;// Chain transaction ID
  @Expose() @Type(() => Date) transferedAt?: Date; // Date at which the chain token transfer has been completed

  // Post stats at the time of snapshot
  @Expose() commentCount: number;
  @Expose() likeCount: number;
  @Expose() rtCount: number;
  @Expose() impressionCount: number;
}