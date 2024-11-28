import { XAccount } from "./x-account";

export type XPost = {
  id: string;
  createdAt: string;
  publishRequestAt?: string; // If this is a post we want to send, this is the date at which we asked to sed this post.
  publishedAt?: string; // Post published date

  botId: string;

  // Raw X data
  text: string; // Core post content
  postId?: string; // ID of the post of X
  parentPostId?: string; // Parent post (id on X) - direct "replied to" = null if root
  quotedPostId?: string; // Post (id on X) that we quote with this post (RT with message).

  xAccount: XAccount;
  xAccountUserId: string;
}

/**
 * Used to pass xPost creation parameters from UI to backend.
 */
export type XPostCreationDTO = {
  xAccountUserId: string; // User sending the post
  text: string;
  // TODO
}