import { Injectable } from "@nestjs/common";
import { runEverySeconds } from "src/utils/run-every-seconds";
import { BotFeaturesService } from "./features.service";
import { XPostFetcherService } from "./features/x-posts-fetcher/x-post-fetcher.service";
import { XPostsReplierService } from "./features/x-posts-replier/x-posts-replier.service";
import { XPostSenderService } from "./features/x-posts-sender/x-post-sender.service";

@Injectable()
export class BotService {

  constructor(
    xPostsFetcher: XPostFetcherService,
    xPostsSender: XPostSenderService,
    xPostsReplier: XPostsReplierService,
    private featuresService: BotFeaturesService
  ) {
    featuresService.registerFeatures([
      xPostsFetcher, // Fetches and caches X Posts
      xPostsReplier, // Handle unanswered third party posts and generate replies when possible.
      xPostsSender, // Send our pending posts/replies to X
    ]);
  }

  /**
   * Root entry point for our bot.
   */
  public run() {
    runEverySeconds(() => this.executeFeatures(), 5);
  }

  /**
   * Sequencially executes recurring execution methods of bot features.
   */
  private async executeFeatures() {
    for (const feature of this.featuresService.getFeatures()) {
      if (feature.canExecuteNow()) {
        await feature.scheduledExecution();
        feature.updateLastExecutionTime();
      }
    }
  }
}