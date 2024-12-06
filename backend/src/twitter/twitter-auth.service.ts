import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot as DBBot } from '@prisma/client';
import { LinkedTwitterAccountInfo, TwitterAuthenticationRequest } from '@x-ai-wallet-bot/common';
import { Subject } from 'rxjs';
import { Bot } from 'src/bots/model/bot';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { ensureEnv } from 'src/utils/ensure-env';
import client, { TwitterApi } from 'twitter-api-v2';

export type TwitterAuthEvent = { botId: string; info: LinkedTwitterAccountInfo };

@Injectable()
export class TwitterAuthService implements OnModuleInit {
  private logger = new AppLogger("TwitterAuth");

  private appConsumerKey: string;
  private appSecret: string;

  private botClient: client; // cached authenticated client to access the bot user.

  public onTwitterAuth$ = new Subject<TwitterAuthEvent>();

  constructor(
    private prisma: PrismaService
  ) { }

  onModuleInit() {
    this.appConsumerKey = ensureEnv("TWITTER_APP_CONSUMER_KEY");
    this.appSecret = ensureEnv("TWITTER_APP_SECRET");
  }

  // public async getAuthenticatedBotAccount(): Promise<XPublisherAccount> {
  //   const botAccount = await this.prisma.xPublisherAccount.findFirst({
  //     orderBy: { updatedAt: "desc" }
  //   });

  //   // if (!botAccount)
  //   //   throw new Error(`No authenticated bot X account info found in database. Run 'yarn twitter:auth' to authorize first.`);

  //   return botAccount;
  // }

  public async getAuthorizedClientForBot(bot: Bot): Promise<client> {
    if (this.botClient)
      return this.botClient;

    this.botClient = new TwitterApi({
      appKey: this.appConsumerKey,
      appSecret: this.appSecret,
      accessToken: bot.dbBot.twitterAccessToken,
      accessSecret: bot.dbBot.twitterAccessSecret
    });

    return this.botClient;
  }

  public getAuthenticationStatus(bot: DBBot) {
    // TODO
  }

  public async startRemoteUserAuth(bot: DBBot): Promise<TwitterAuthenticationRequest> {
    this.logger.log("Starting twitter/x authentication process for a user.");

    // TODO: first clear existing auth from DB

    this.logger.log("Generating auth link.");
    const step1Client = new TwitterApi({ appKey: this.appConsumerKey, appSecret: this.appSecret });
    const authLink = await step1Client.generateAuthLink();

    if (!authLink)
      return null;

    return {
      oauth_token: authLink.oauth_token,
      oauth_token_secret: authLink.oauth_token_secret,
      url: authLink.url,
    }
  }

  public async finalizeTwitterAuthenticationWithPIN(dbBot: DBBot, request: TwitterAuthenticationRequest, pinCode: string): Promise<LinkedTwitterAccountInfo> {
    const step2Client = new TwitterApi({
      appKey: this.appConsumerKey,
      appSecret: this.appSecret,
      accessToken: request.oauth_token,
      accessSecret: request.oauth_token_secret
    });

    this.logger.log("Signing in to target account");
    try {
      const { client: loggedClient, accessToken, accessSecret } = await step2Client.login(pinCode);
      const user = await loggedClient.currentUser();

      if (!user) {
        this.logger.error("Hmm, auth failed for some reason");
        return;
      }

      const newTwitterInfo: LinkedTwitterAccountInfo = {
        twitterAccessSecret: accessSecret,
        twitterAccessToken: accessToken,
        twitterUserId: user.id_str,
        twitterUserName: user.name,
        twitterUserScreenName: user.screen_name
      }

      this.onTwitterAuth$.next({
        botId: dbBot.id,
        info: newTwitterInfo
      });

      return newTwitterInfo;
    }
    catch (e) {
      this.logger.error("Failed to finalize twitter auth:");
      this.logger.error(e);
      return null;
    }
  }

  /**
   * Interactive authentication using command line PIN input
   */
  // public async startCommandLineUserAuth() {
  //   this.logger.log("Starting twitter/x authentication process for a user.");

  //   this.logger.log("Generating auth link, please wait.");
  //   const step1Client = new TwitterApi({ appKey: this.appConsumerKey, appSecret: this.appSecret });
  //   const authLink = await step1Client.generateAuthLink();

  //   this.logger.log("Open this URL in the browser, accept request and copy PIN code:");
  //   this.logger.log(authLink.url);

  //   const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  //   const userPINCode = await rl.question('Please input PIN code: ');

  //   const step2Client = new TwitterApi({
  //     appKey: this.appConsumerKey,
  //     appSecret: this.appSecret,
  //     accessToken: authLink.oauth_token,
  //     accessSecret: authLink.oauth_token_secret
  //   });

  //   this.logger.log("Signing in to target account");
  //   const { client: loggedClient, accessToken, accessSecret } = await step2Client.login(userPINCode);
  //   const user = await loggedClient.currentUser();

  //   if (!user) {
  //     this.logger.error("Hmm, auth failed for some reason");
  //     return;
  //   }

  //   // Save auth access to DB
  //   const update = {
  //     userName: user.name,
  //     userScreenName: user.screen_name,

  //     accessToken,
  //     accessSecret,

  //     updatedAt: new Date()
  //   };

  //   await this.prisma.xPublisherAccount.upsert({
  //     where: { userId: user.id_str },
  //     create: { userId: user.id_str, ...update },
  //     update
  //   });

  //   this.logger.log("Authentication successful and saved. You can start now start the bot.");
  // }
}
