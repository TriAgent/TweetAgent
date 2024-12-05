import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { BotFeatureType } from "@prisma/client";
import { AppLogger } from "src/logs/app-logger";
import { TwitterAuthService } from "src/twitter/twitter-auth.service";
import { runEverySeconds } from "src/utils/run-every-seconds";
import { DispatcherService } from "src/websockets/dispatcher.service";
import { BotsService } from "./bots.service";

@Injectable()
export class BotsRunnerService {
  private logger = new AppLogger("BotRunner");

  constructor(
    @Inject(forwardRef(() => BotsService)) private botsService: BotsService,
    private dispatcherService: DispatcherService,
    @Inject(forwardRef(() => TwitterAuthService)) private twitterAuth: TwitterAuthService,
  ) { }

  /**
   * Root entry point for our bot.
   */
  public async run() {
    this.logger.log("Bot runner is starting");

    runEverySeconds(() => this.executeRootFeatures(), 5);
  }

  /**
   * Sequencially executes recurring execution methods of bots features.
   */
  private async executeRootFeatures() {
    for (const bot of this.botsService.getBots()) {
      const rootFeature = bot.getFeatureByType(BotFeatureType.Root);

      if (rootFeature.canExecuteNow()) {
        await rootFeature.scheduledExecution();
        rootFeature.updateLastExecutionTime();
      }
    }
  }
}