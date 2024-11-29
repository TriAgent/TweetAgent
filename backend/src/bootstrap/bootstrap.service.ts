import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { AppLogger } from 'src/logs/app-logger';
import { TwitterAuthService } from 'src/twitter/twitter-auth.service';
import { sleepSecs } from 'src/utils/sleep';
import { options } from 'yargs';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private logger = new AppLogger("Bootstrap");

  constructor(
    private botsService: BotsService,
    private twitterAuth: TwitterAuthService
  ) { }

  onApplicationBootstrap() {
    //void this.parseCommandLineArgs();

    this.botsService.run();
  }

  // @deprecated
  private async parseCommandLineArgs() {
    await sleepSecs(1);

    console.log("");
    this.logger.log("Parsing command line arguments");

    let argv = await options({
    }).help().argv;
  }
}