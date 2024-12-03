import { XPost } from "@services/posts/model/x-post";
import { FeatureHandler, PostTag } from "../feature-handler";

export class XPostContestHandler extends FeatureHandler {
  public getPostTags(post: XPost): PostTag[] {

    if (post.worthForAirdropContest)
      return [{label: "Worth for airdrop contest", type: "success"}]

    return [];
  }
}