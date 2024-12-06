import { XPost } from "@services/posts/model/x-post";
import { FeatureHandler, PostTag } from "../feature-handler";

export class XRealNewsHandler extends FeatureHandler {
  public getPostTags(post: XPost): PostTag[] {
    const tags: PostTag[] = [];

    if (post.isRealNews)
      tags.push({label: "Real news", type: "success"});

    return tags;
  }
}