import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import { prisma } from "src/services";

export type SummaryDocument = Document<{ "author", "postId", "post" }>;

/**
 * Loads posts that are eligible for the airdrop contest but not yet used, from the database, 
 * as a list of langchain documents.
 */
export class PendingContestPostLoader extends BaseDocumentLoader {
  constructor() {
    super();
  }

  async load(): Promise<SummaryDocument[]> {
    const posts = await prisma().xPost.findMany({
      where: {
        worthForAirdropContest: true,
        quotedForAirdropContestAt: null
        // TODO: last 6 hours max
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    return posts.map(p => new Document({
      pageContent: p.text.replaceAll('\n', ''),
      metadata: {
        author: p.authorId,
        id: p.id,
        postId: p.id,
        post: p
      }
    }));
  }
}
