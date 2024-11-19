import { LangchainService } from "./langchain/langchain.service";
import { app } from "./main";
import { PrismaService } from "./prisma/prisma.service";
import { TwitterAuthService } from "./twitter/twitter-auth.service";
import { TwitterService } from "./twitter/twitter.service";
import { XAccountsService } from "./xaccounts/xaccounts.service";
import { XPostsService } from "./xposts/xposts.service";

export const prisma = (): PrismaService => {
  return app.get(PrismaService);
}

export const langchain = (): LangchainService => {
  return app.get(LangchainService);
}

export const xAccounts = (): XAccountsService => {
  return app.get(XAccountsService);
}

export const xPosts = (): XPostsService => {
  return app.get(XPostsService);
}

export const twitter = (): TwitterService => {
  return app.get(TwitterService);
}

export const twitterAuth = (): TwitterAuthService => {
  return app.get(TwitterAuthService);
}