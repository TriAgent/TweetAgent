import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import moment from "moment";
import { prisma } from "src/services";

export type SummaryDocument = Document<{ "authorId", "postId", "post" }>;

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
        quotedForAirdropContestAt: null,
        createdAt: { gt: moment().subtract(6, "hours").toDate() }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        xAccount: true
      }
    });

    return posts.map(p => new Document({
      pageContent: p.text.replaceAll('\n', ''),
      metadata: {
        authorId: p.xAccount.userId,
        id: p.id,
        postId: p.id,
        post: p
      }
    }));
  }
}
