import { Injectable } from "@nestjs/common";
import { runEverySeconds } from "src/utils/run-every-seconds";
import { BotFeaturesService } from "./features.service";
import { AirdropSenderService } from "./features/airdrop-contest/airdrop-sender/airdrop-sender-service";
import { AirdropSnapshotService } from "./features/airdrop-contest/airdrop-snapshot/airdrop-snapshot-service";
import { XPostAirdropAddressService } from "./features/airdrop-contest/x-post-airdrop-address/x-post-airdrop-address.service";
import { XPostContestHandlerService } from "./features/airdrop-contest/x-post-contest-handler/x-post-contest-handler.service";
import { XPostContestReposterService } from "./features/airdrop-contest/x-post-contest-reposter/x-post-contest-reposter.service";
import { XPostFetcherService } from "./features/core/x-posts-fetcher/x-post-fetcher.service";
import { XPostsHandlerService } from "./features/core/x-posts-handler/x-posts-handler.service";
import { XPostSenderService } from "./features/core/x-posts-sender/x-post-sender.service";
import { XNewsSummaryReplierService } from "./features/news-summaries/x-news-summary-replier/x-news-summary-replier.service";
import { XNewsSummaryWriterService } from "./features/news-summaries/x-news-summary-writer/x-summary-writer.service";
import { XRealNewsFilterService } from "./features/news-summaries/x-real-news-filter/x-real-news-filter.service";

@Injectable()
export class BotService {
  constructor(
    private featuresService: BotFeaturesService,
    // Features
    xPostsFetcher: XPostFetcherService,
    xPostsSender: XPostSenderService,
    xPostsHandler: XPostsHandlerService,
    xNewsSummaryWriter: XNewsSummaryWriterService,
    xNewsSummaryReplier: XNewsSummaryReplierService,
    xRealNewsFilter: XRealNewsFilterService,
    xPostContestHandler: XPostContestHandlerService,
    xPostContestReposter: XPostContestReposterService,
    xPostAirdropAddress: XPostAirdropAddressService,
    airdropSnapshot: AirdropSnapshotService,
    airdropSender: AirdropSenderService
  ) {
    featuresService.registerFeatures([
      xPostsFetcher, // Fetches and caches X Posts
      xPostsHandler, // Handle unanswered third party posts and generate replies when possible.
      xPostsSender, // Send our pending posts/replies to X
      xNewsSummaryWriter, // From time to time, write news summary from cached news posts, and publish to X
      xNewsSummaryReplier, // Write replies to users posts following our news summary posts
      xRealNewsFilter, // Browses recent posts from followed X news accounts, and classifies posts as real news or not (used by the news summary writer).
      xPostContestHandler, // Classifies upcoming X posts as eligible for the airdrop contest or not
      xPostContestReposter, // RTs user posts from time to time, for the airdrop contest
      xPostAirdropAddress, // Collects user airdrop addresses from X posts and acknowledges with a reply when successfully handled
      airdropSnapshot, // Elects best posts and dispatches airdrop tokens to authors
      airdropSender, // Sends airdrop tokens on chain
    ]);
  }

  /**
   * Root entry point for our bot.
   */
  public async run() {
    // Safety check
    for (const feature of this.featuresService.getFeatures()) {
      if (feature.runLoopMinIntervalSec === undefined && feature.scheduledExecution !== undefined)
        throw new Error(`Feature has an execution method but not loop interval configured!`);

      await feature.initialize();
    }

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