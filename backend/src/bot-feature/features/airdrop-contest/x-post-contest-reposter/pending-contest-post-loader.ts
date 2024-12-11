import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import { BotFeatureType } from "@x-ai-wallet-bot/common";
import moment from "moment";
import { Bot } from "src/bots/model/bot";
import { prisma } from "src/services";
import { XPostContestHandlerFeature } from "../x-post-contest-handler/x-post-contest-handler.feature";

export type SummaryDocument = Document<{ "authorId", "postId", "post" }>;

/**
 * Loads posts that are eligible for the airdrop contest but not yet used, from the database, 
 * as a list of langchain documents.
 */
export class PendingContestPostLoader extends BaseDocumentLoader {
  constructor(private bot: Bot) {
    super();
  }

  async load(): Promise<SummaryDocument[]> {
    const airdropHandlerFeature = this.bot.getFeatureByType<XPostContestHandlerFeature>(BotFeatureType.AirdropContest_XPostContestHandler);
    const maxAge = airdropHandlerFeature.config.maxPostAge;

    const posts = await prisma().xPost.findMany({
      where: {
        botId: this.bot.id,
        worthForAirdropContest: true,
        quotedForAirdropContestAt: null,
        publishedAt: { gt: moment().subtract(maxAge, "seconds").toDate() } // Dismiss old posts, we only want fresh ones
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
