import { forwardRef, Inject, Injectable } from "@nestjs/common";
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
          this.dispatcherService.emitMostRecentFeatureAction(bot, feature, "scheduledExecution");

          await feature.scheduledExecution();
          feature.updateLastExecutionTime();

          this.dispatcherService.emitMostRecentFeatureAction(bot, feature, undefined);
        }
      }
    }
  }
}