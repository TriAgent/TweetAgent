import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BotService } from 'src/bot/bot.service';
import { TwitterAuthService } from 'src/twitter/twitter-auth.service';
import { sleepSecs } from 'src/utils/sleep';
import { options } from 'yargs';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private logger = new Logger("Bootstrap");

  constructor(
    private bot: BotService,
    private twitterAuth: TwitterAuthService
  ) { }

  onApplicationBootstrap() {
    void this.parseCommandLineArgs();
  }

  private async parseCommandLineArgs() {
    await sleepSecs(1);

    console.log("");
    this.logger.log("Parsing command line arguments");

    let argv = await options({
      'twitter:auth': { type: 'boolean' },
      'bot:run': { type: 'boolean' },
    }).help().argv;

    if (argv["twitter:auth"])
      void this.twitterAuth.startUserAuth();
    else if (argv["bot:run"]) {
      void this.bot.run();
    }
  }
}