import { XPost } from "@services/posts/model/x-post";
import { FeatureHandler, PostTag } from "../feature-handler";

export class XPostHandler extends FeatureHandler {
  public getPostTags(post: XPost): PostTag[] {
    const tags:PostTag[] = [];

    if (post.wasReplyHandled)
      tags.push({label: "Reply handled", type: "success"});
    else
      tags.push({label: "Reply not handled", type: "warning"});

    if (post.isSimulated)
      tags.push({label: "Simulated post", type: "warning"});
    else
      tags.push({label: "Real X post", type: "success"});

    if (!post.isSimulated && post.publishedAt)
      tags.push({label: "Published on X", type: "success"});
    else
      tags.push({label: "Not published on X", type: "warning"});

    return tags;
  }
}