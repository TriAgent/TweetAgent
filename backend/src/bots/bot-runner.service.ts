import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { runEverySeconds } from "src/utils/run-every-seconds";
import { XAccountsService } from "src/xaccounts/xaccounts.service";
import { BotsService } from "./bots.service";
import { BotFeaturesService } from "./features.service";

@Injectable()
export class BotsRunnerService {
  constructor(
    @Inject(forwardRef(() => BotsService)) private botsService: BotsService,
    private featuresService: BotFeaturesService,
    private xAccounts: XAccountsService,
    private twitterAuth: TwitterAuthService,
    /* 
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
        airdropSender: AirdropSenderFeature */
  ) {
    /* featuresService.registerFeatures([
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
    ]); */
  }

  /**
   * Root entry point for our bot.
   */
  public async run() {
    // Fetch/cache X account info to DB
    const botXAccount = await this.twitterAuth.getAuthenticatedBotAccount();
    await this.xAccounts.ensureXAccount(botXAccount.userId);

    runEverySeconds(() => this.executeBots(), 5);
  }

  /**
   * Sequencially executes recurring execution methods of bots features.
   */
  private async executeBots() {
    for (const bot of this.botsService.getBots()) {
      const activeFeatures = await bot.getActiveFeatures();

      for (const feature of activeFeatures) {
        if (feature.canExecuteNow()) {
          await feature.scheduledExecution();
          feature.updateLastExecutionTime();
        }
      }
    }
  }
}