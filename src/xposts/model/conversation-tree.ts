import { XPost } from "@prisma/client";

export class ConversationTree {
  public children: ConversationTree[] = [];

  constructor(public post: XPost) { }

  /**
   * Returns the flat list of posts that contain the given search string in their text content.
   * Recursive in the whole tree
   */
  public searchPosts(search: string): XPost[] {
    const results: XPost[] = [];

    if (this.post.text.indexOf(search) >= 0)
      results.push(this.post);

    results.push(...this.children.flatMap(c => c.searchPosts(search)));

    return results;
  }
}
