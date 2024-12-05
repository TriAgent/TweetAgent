import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { XAccount } from '@prisma/client';
import { Bot } from 'src/bots/model/bot';
import { AppLogger } from 'src/logs/app-logger';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwitterService } from 'src/twitter/twitter.service';
import { UserV2 } from 'twitter-api-v2';
import { fakeAccounts } from './model/fake-accounts';


@Injectable()
export class XAccountsService implements OnApplicationBootstrap {
  private logger = new AppLogger("XAccounts");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService
  ) { }

  async onApplicationBootstrap() {
    await this.ensureFakeAccounts();
  }

  public async getXAccountFromUserId(userId: string): Promise<XAccount> {
    return this.prisma.xAccount.findUnique({
      where: { userId }
    });
  }

  /**
   * Returns the existing XAccount if the user id is known in database.
   * Otherwise, tries to fetch the user from X API, then saves it.
   */
  public async ensureXAccount(bot: Bot, userId: string): Promise<XAccount> {
    let xAccount = await this.getXAccountFromUserId(userId);
    if (!xAccount) {
      const user = await this.twitter.fetchAccountByUserId(bot, userId);
      if (!user)
        throw new Error(`No X user found with user ID ${userId}`);

      xAccount = await this.createXAccountFromXUser(user);
    }

    return xAccount;
  }

  /**
   * Gets account from database, and if missing, fetch from twitter
   */
  public async getXAccountsFromScreenNames(bot: Bot, screenNames: string[]): Promise<XAccount[]> {
    const accounts: XAccount[] = [];

    for (const userScreenName of screenNames) {
      let account = await this.prisma.xAccount.findFirst({ where: { userScreenName } });

      if (!account) {
        // Not in database, try to find on twitter
        const xUser = await this.twitter.fetchAccountByUserName(bot, userScreenName);
        if (!xUser) {
          this.logger.warn(`No user found on X with screen name "${userScreenName}".`);
          continue;
        }

        // Save as new XAccount in DB
        account = await this.createXAccountFromXUser(xUser);
      }

      if (account)
        accounts.push(account);
    }

    return accounts;
  }

  public createXAccountFromXUser(xUser: UserV2): Promise<XAccount> {
    return this.prisma.xAccount.create({
      data: {
        userId: xUser.id,
        userName: xUser.name,
        userScreenName: xUser.username
      }
    });
  }

  public getXUserIdFromScreenName(bot: Bot, userScreenName: string): Promise<XAccount> {
    return this.getXAccountsFromScreenNames(bot, [userScreenName])?.[0];
  }

  /**
   * Ensures that some fake accounts are created in the database.
   * Used to simulate publishing accounts for simulated posts, without using with real X accounts.
   * Like totally different users.
   */
  public async ensureFakeAccounts() {
    for (const fakeAccount of fakeAccounts) {
      await this.prisma.xAccount.upsert({
        where: { userId: fakeAccount.userId },
        create: {
          userId: fakeAccount.userId,
          userName: fakeAccount.userName,
          userScreenName: fakeAccount.userScreenName
        },
        update: {}
      });
    }
  }

  public listAllAccounts() {
    return this.prisma.xAccount.findMany({});
  }

  public listFakeAccounts() {
    const fakeAccountsIds = fakeAccounts.map(a => a.userId);
    return this.prisma.xAccount.findMany({
      where: { userId: { in: fakeAccountsIds } }
    });
  }
}
