import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { TwitterAuthService } from 'src/twitter/twitter-auth.service';
import { sleepSecs } from 'src/utils/sleep';
import { options } from 'yargs';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private logger = new Logger("Bootstrap");

  constructor(
    private botsService: BotsService,
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
      void this.botsService.run();
    }
    else {
      this.logger.warn(`No run command was passed, nothing might happen`);
    }
  }
}