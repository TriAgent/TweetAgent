import { Injectable, Logger } from "@nestjs/common";
import { OperationHistoryType, XPost } from "@prisma/client";
import * as moment from "moment";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterService } from "src/twitter/twitter.service";

const CheckRepliesDelayMs = 60 * 1000; // 1 minute

/**
 * This service monitors third party user replies to posts we published, decides to reply and with which content.
 */
@Injectable()
export class XReplierService {
  private logger = new Logger("XReplier");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService
  ) { }

  /**
   * TODO:
   * - fetch replies via API
   * - store replies into DB (so for ex we reply later, not instantly)
   * - classify:
   *  - has question? has disagreement?
   *  - is request for financial advice?
   *  - etc
   * - based on all the classification factors, decide:
   *  - to reply or not
   *  - which agent replies
   *  - post reply
   */

  public run() {
    this.fetchRecentReplies();
  }

  /**
   * Permanent loop that fetches recent replies to posts published by our bot.
   * Posts are stored into database for later use.
   */
  private async fetchRecentReplies() {
    // Check when we last fetched
    let latestFetchDate = await this.lastRepliesFetchDate();
    if (!latestFetchDate) {
      // No entry yet? Fetch only since a few hours ago to save data
      latestFetchDate = moment().subtract(12, "hours").toDate();
    }

    // Fetch recent replies, not earlier than last time we checked
    this.logger.log(`Fetching recent X replies not earlier than ${latestFetchDate}`);
    const replies = await this.twitter.fetchRepliesToSelf(moment(latestFetchDate));
    this.logger.log(`Got ${replies.length} replies from twitter api`);

    // Store every reply that we don't have yet
    const newReplies: XPost[] = [];
    for (var reply of replies) {
      console.log("reply", reply)

      const existingReply = await this.getDBReplyByTwitterPostId(reply.id);
      if (!existingReply) {
        // Find parent tweet
        // TODO const parentPostId =

        // Save reply to database
        const dbReply = await this.prisma.xPost.create({
          data: {
            text: reply.text,
            authorId: reply.author_id,
            postId: reply.id,
            contentDate: reply.created_at,
            parentPostId: reply.in_reply_to_user_id,
            rootPostId: reply.conversation_id,
            isNewsPost: false
          }
        });
        newReplies.push(dbReply);
      }
    }

    // Remember last fetch time
    await this.prisma.operationHistory.create({ data: { type: OperationHistoryType.FetchRepliesToSelf } });

    setTimeout(() => {
      this.fetchRecentReplies();
    }, CheckRepliesDelayMs);
  }

  private async lastRepliesFetchDate(): Promise<Date> {
    const mostRecentFetch = await this.prisma.operationHistory.findFirst({
      where: { type: OperationHistoryType.FetchRepliesToSelf },
      orderBy: { createdAt: "desc" }
    });

    return mostRecentFetch?.createdAt; // possibly undefined if just starting
  }

  private getDBReplyByTwitterPostId(twitterPostId: string): Promise<XPost> {
    return this.prisma.xPost.findFirst({ where: { postId: twitterPostId } });
  }
}