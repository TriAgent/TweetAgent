import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { XPublisherAccount } from '@prisma/client';
import * as readline from 'readline/promises';
import { PrismaService } from 'src/prisma/prisma.service';
import { ensureEnv } from 'src/utils/ensure-env';
import client, { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterAuthService implements OnModuleInit {
  private logger = new Logger(TwitterAuthService.name);

  private appConsumerKey: string;
  private appSecret: string;

  private botClient: client; // cached authenticated client to access the bot user.

  constructor(private prisma: PrismaService) { }

  onModuleInit() {
    this.appConsumerKey = ensureEnv("TWITTER_APP_CONSUMER_KEY");
    this.appSecret = ensureEnv("TWITTER_APP_SECRET");
  }

  public async getAuthenticatedBotAccount(): Promise<XPublisherAccount> {
    const botAccount = await this.prisma.xPublisherAccount.findFirst({
      orderBy: { updatedAt: "desc" }
    });

    if (!botAccount)
      throw new Error(`No authenticated bot X account info found in database. Run 'yarn twitter:auth' to authorize first.`);

    return botAccount;
  }

  public async getAuthorizedClientForBot(): Promise<client> {
    if (this.botClient)
      return this.botClient;

    // Get auth keys from DB
    const botAuth = await this.getAuthenticatedBotAccount();

    this.botClient = new TwitterApi({
      appKey: this.appConsumerKey,
      appSecret: this.appSecret,
      accessToken: botAuth.accessToken,
      accessSecret: botAuth.accessSecret
    });

    return this.botClient;
  }

  public async startUserAuth() {
    this.logger.log("Starting twitter/x authentication process for a user.");

    this.logger.log("Generating auth link, please wait.");
    const step1Client = new TwitterApi({ appKey: this.appConsumerKey, appSecret: this.appSecret });
    const authLink = await step1Client.generateAuthLink();

    this.logger.log("Open this URL in the browser, accept request and copy PIN code:");
    this.logger.log(authLink.url);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const userPINCode = await rl.question('Please input PIN code: ');

    const step2Client = new TwitterApi({
      appKey: this.appConsumerKey,
      appSecret: this.appSecret,
      accessToken: authLink.oauth_token,
      accessSecret: authLink.oauth_token_secret
    });

    this.logger.log("Signing in to target account");
    const { client: loggedClient, accessToken, accessSecret } = await step2Client.login(userPINCode);
    const user = await loggedClient.currentUser();

    if (!user) {
      this.logger.error("Hmm, auth failed for some reason");
      return;
    }

    // Save auth access to DB
    const update = {
      userName: user.name,
      userScreenName: user.screen_name,

      accessToken,
      accessSecret,

      updatedAt: new Date()
    };

    await this.prisma.xPublisherAccount.upsert({
      where: { userId: user.id_str },
      create: { userId: user.id_str, ...update },
      update
    });

    this.logger.log("Authentication successful and saved. You can start now start the bot.");
  }
}
