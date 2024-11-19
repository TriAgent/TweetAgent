import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import { PrismaService } from "src/prisma/prisma.service";

export type SummaryDocument = Document<{ "author", "id" }>;

/**
 * Loads twitter posts from database, as a list of langchain documents.
 */
export class SummaryPostLoader extends BaseDocumentLoader {
  constructor(private prisma: PrismaService) {
    super();
  }

  async load(): Promise<SummaryDocument[]> {
    const posts = await this.prisma.xPost.findMany({
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
        author: p.authorId,
        id: p.id
      }
    }));
  }
}
