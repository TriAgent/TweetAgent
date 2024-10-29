import { LangchainService } from "./langchain/langchain.service";
import { app } from "./main";
import { TwitterAuthService } from "./twitter/twitter-auth.service";
import { XPostsService } from "./xposts/xposts.service";

export const langchain = (): LangchainService => {
  return app.get(LangchainService);
}

export const xPosts = (): XPostsService => {
  return app.get(XPostsService);
}

export const twitterAuth = (): TwitterAuthService => {
  return app.get(TwitterAuthService);
}