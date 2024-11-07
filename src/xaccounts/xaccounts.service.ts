import { Injectable, Logger } from '@nestjs/common';
import { XAccount } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwitterService } from 'src/twitter/twitter.service';

@Injectable()
export class XAccountsService {
  private logger = new Logger("XAccounts");

  constructor(
    private prisma: PrismaService,
    private twitter: TwitterService
  ) { }

  public async getXAccountFromUserId(userId: string): Promise<XAccount> {
    return this.prisma.xAccount.findUnique({
      where: { userId }
    });
  }

  /**
   * Gets account from database, and if missing, fetch from twitter
   */
  public async getXAccountsFromScreenNames(screenNames: string[]): Promise<XAccount[]> {
    const accounts: XAccount[] = [];

    for (const userScreenName of screenNames) {
      let account = await this.prisma.xAccount.findFirst({ where: { userScreenName } });

      if (!account) {
        // Not in database, try to find on twitter
        const xUser = await this.twitter.fetchAccountByUserName(userScreenName);
        if (!xUser) {
          this.logger.warn(`No user found on X with screen name "${userScreenName}".`);
          continue;
        }

        // Save as new XAccount in DB
        account = await this.prisma.xAccount.create({
          data: {
            userId: xUser.id,
            userName: xUser.name,
            userScreenName: xUser.username
          }
        });
      }

      if (account)
        accounts.push(account);
    }

    return accounts;
  }

  public getXUserIdFromScreenName(userScreenName: string): Promise<XAccount> {
    return this.getXAccountsFromScreenNames([userScreenName])?.[0];
  }
}
