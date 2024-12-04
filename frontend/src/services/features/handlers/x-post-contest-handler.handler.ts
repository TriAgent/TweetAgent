import { XPost } from "@services/posts/model/x-post";
import { FeatureHandler, PostTag } from "../feature-handler";

export class XPostContestHandler extends FeatureHandler {
  public getPostTags(post: XPost): PostTag[] {
    const tags: PostTag[] = [];

    if (post.worthForAirdropContest)
      tags.push({label: "Worth for airdrop contest", type: "success"});

    if (post.contestQuotedPostId)
      tags.push({label: "Quote for contest", type: "success"});

    return tags;
  }
}