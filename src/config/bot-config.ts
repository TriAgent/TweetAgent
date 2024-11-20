
export const BotConfig = {
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
    IsActive: process.env.BOT_FEATURE_AIRDROP_CONTEST === "1"
  },
  X: {
    PublishPosts: process.env.PUBLISH_X_POSTS === "1"
  }
}
