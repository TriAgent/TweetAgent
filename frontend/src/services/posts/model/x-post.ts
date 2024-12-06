import { PostTag } from "@services/features/feature-handler";
import { featureHandlers } from "@services/features/features.service";
import type { XAccount, XPost as XPostDTO } from "@x-ai-wallet-bot/common";
import { Expose, Type } from "class-transformer";
import { flatten } from "lodash";

type RefactoredXPost = Omit<XPostDTO, "createdAt"|"publishRequestAt"|"publishedAt">;

export class XPost implements RefactoredXPost {
  @Expose() public id: string;

  @Expose() @Type(() => Date) public createdAt: Date;
  @Expose() @Type(() => Date) public publishRequestAt?: Date;
  @Expose() @Type(() => Date) public publishedAt?: Date;
  
  @Expose() public botId: string;
  @Expose() public xAccount: XAccount;
  @Expose() public xAccountUserId: string;

  // Raw X data
  @Expose() public text: string; // Core post content
  @Expose() public postId?: string; // ID of the post of X
  @Expose() public parentPostId?: string; // Parent post (id on X) - direct "replied to" = null if root
  @Expose() public quotedPostId?: string; // Post (id on X) that we quote with this post (RT with message).

  @Expose() public isSimulated: boolean;
  @Expose() public wasReplyHandled: boolean;
  @Expose() public worthForAirdropContest?: boolean;
  @Expose() public contestQuotedPostId?:string;
  @Expose() public isRealNews: boolean;

  public getTags(): PostTag[] {
    return flatten(featureHandlers.map(h => h.getPostTags(this)));
  }
}