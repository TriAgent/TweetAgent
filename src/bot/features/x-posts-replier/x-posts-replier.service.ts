import { Injectable, Logger } from "@nestjs/common";
import { BotFeature } from "src/bot/model/bot-feature";
import { PrismaService } from "src/prisma/prisma.service";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";

/**
 * Service responsible for handling saved X posts that interacted with our X account,
 * and decide whether to reply or not.
 * 
 * Replies are built by asking other features to categorize and build reply parts.
 */
@Injectable()
export class XPostsReplierService extends BotFeature {
  private logger = new Logger("XPostsReplier");

  constructor(
    private twitterAuth: TwitterAuthService,
    private prisma: PrismaService,
  ) {
    super(5);
  }

  public async scheduledExecution() {
    await this.checkUnhandledPosts();
  }

  private async checkUnhandledPosts() {
    this.logger.log("Checking unhandled posts to potentially create replies");

    const botAccount = await this.twitterAuth.getAuthenticatedBotAccount();

    // Find the first post eligible for a reply analysis. This means replies we have received from users
    // and that have not been handled yet.
    const xReply = await this.prisma.xPost.findFirst({
      where: {
        authorId: { not: botAccount.userId },
        ///type: XPostType.UserReply, // Only reply to what third party users wrote
        parentPostId: { not: null }, // is a reply
        wasReplyHandled: false
      }
    });

    // TODO: here we should go through all features and run studyReplyToXPost() to gather feedbacks,
    // then post a X reply
  }
}