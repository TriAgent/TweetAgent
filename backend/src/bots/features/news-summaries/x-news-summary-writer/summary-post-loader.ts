import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import { prisma } from "src/services";

export type SummaryDocument = Document<{ "author", "id" }>;

/**
 * Loads twitter posts from database, as a list of langchain documents.
 */
export class SummaryPostLoader extends BaseDocumentLoader {
  constructor() {
    super();
  }

  async load(): Promise<SummaryDocument[]> {
    const posts = await prisma().xPost.findMany({
      where: {
        isRealNews: true, // Post must be considered as a real news, useful to summarize
        summarizedById: null // Post must not be used by a summary post yet
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    return posts.map(p => new Document({
      pageContent: p.text.replaceAll('\n', ''),
      metadata: {
        author: p.xAccountUserId,
        id: p.id
      }
    }));
  }
}
