import { BotFeatureService } from "./bot-feature/bot-feature.service";
import { BotsService } from "./bots/bots.service";
import { LangchainService } from "./langchain/langchain.service";
import { app } from "./main";
import { OperationHistoryService } from "./operation-history/operation-history.service";
import { PrismaService } from "./prisma/prisma.service";
import { TwitterAuthService } from "./twitter/twitter-auth.service";
import { TwitterService } from "./twitter/twitter.service";
import { DispatcherService } from "./websockets/dispatcher.service";
import { XAccountsService } from "./xaccounts/xaccounts.service";
import { XPostsService } from "./xposts/xposts.service";

export const prisma = (): PrismaService => {
  return app.get(PrismaService);
}

export const langchainService = (): LangchainService => {
  return app.get(LangchainService);
}

export const xAccountsService = (): XAccountsService => {
  return app.get(XAccountsService);
}

export const xPostsService = (): XPostsService => {
  return app.get(XPostsService);
}

export const twitterService = (): TwitterService => {
  return app.get(TwitterService);
}

export const twitterAuthService = (): TwitterAuthService => {
  return app.get(TwitterAuthService);
}

export const botsService = (): BotsService => {
  return app.get(BotsService);
}

export const botFeatureService = (): BotFeatureService => {
  return app.get(BotFeatureService);
}

export const operationHistoryService = (): OperationHistoryService => {
  return app.get(OperationHistoryService);
}

export const wsDispatcherService = (): DispatcherService => {
  return app.get(DispatcherService);
}