import { join } from "path";
import { BaseSepolia, findChainToken } from "./chain-config";

export const BotConfig = {
  AiPrompts: {
    Folder: join(__dirname, "../../ai-prompts"),
    // List of prompt types required for the app. Must be kept up to date otherwise prompts can't get loaded by the 
    // prompt service.
    RequiredTypes: [
      // Core
      "core/produce-aggregated-reply",
      // News summaries
      "news-summaries/reply-to-news-reply-tweet-traits/cheerful",
      "news-summaries/reply-to-news-reply-tweet-traits/opinion",
      "news-summaries/reply-to-news-reply-tweet-traits/pricing",
      "news-summaries/reply-to-news-reply-tweet-traits/question",
      "news-summaries/categorize-news",
      "news-summaries/classify-post",
      "news-summaries/create-news-summary",
      "news-summaries/reply-to-news-reply",
      // Airdrop contest
      "airdrop-contest/elect-best-post-for-contest",
      "airdrop-contest/extract-address",
      "airdrop-contest/study-for-contest",
      "airdrop-contest/write-post-quote-content",
    ]
  },
  NewsSummaryBot: {
    IsActive: process.env.BOT_FEATURE_SUMMARIZE_NEWS === "1",
    Generation: {
      Personality: `
        You are an analytically rigorous, independent thinker with a strong orientation toward accuracy, 
        quality, and intellectual integrity. You value correctness over consensus and prefer first-principle 
        reasoning, seeking both consensus and non-consensus insights to inform your assessments. 
        With a high tolerance for unconventional approaches, you align with iconoclasts and contrarian 
        perspectives, often challenging mainstream narratives. Your quality-focus and skeptical approach 
        make it ideal for high-stakes, data-driven tasks. 
  
        - Use a crypto expert attitude but make sure to use simple terms. 
        - Avoid using too many impressive adjectives.
      `
    },
    News: {
      // Source accounts on X that we want to retrieve tweets from, and make summaries of.
      XSourceAccounts: [
        'BitcoinMagazine',
        'crypto', // bloomberg crypto
        'cryptonews'
      ]
    }
  },
  AirdropContest: {
    IsActive: process.env.BOT_FEATURE_AIRDROP_CONTEST === "1",
    MinHoursBetweenAirdrops: 24,
    TokenAmountPerAirdrop: 100, // eg: 100 usdt every 24h, total, dispatched between all winning posts
    DaysBeforeStatCollection: 7, // Number of days to wait before making a post eligible for airdrop.
    Personality: `All your produced texts should sound more like human speakers, not like an "AI"`,

    // Chain related
    Chain: BaseSepolia,
    Token: findChainToken(BaseSepolia, "UTT"),
    WalletPrivateKey: process.env.AIRDROP_WALLET_PRIVATE_KEY
  },
  X: {
    PublishPosts: process.env.PUBLISH_X_POSTS === "1"
  }
}
