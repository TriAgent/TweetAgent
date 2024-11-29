import type { XAccount } from "@x-ai-wallet-bot/common";
import { Expose, Type } from "class-transformer";

export class XPost {
  @Expose() public id: string;
  @Expose() @Type(() => Date) public createdAt: Date;
  @Expose() @Type(() => Date) public publishRequestAt?: Date;
  @Expose() @Type(() => Date) public publishedAt?: Date;
  @Expose() public botId: string;

  // Raw X data
  @Expose() public text: string; // Core post content
  @Expose() public postId?: string; // ID of the post of X
  @Expose() public parentPostId?: string; // Parent post (id on X) - direct "replied to" = null if root
  @Expose() public quotedPostId?: string; // Post (id on X) that we quote with this post (RT with message).

  @Expose() public isSimulated: boolean;
  @Expose() public wasReplyHandled: boolean;

  @Expose() public xAccount: XAccount;
  @Expose() public xAccountUserId: string;
}