import { join } from "path";
import { ElastosTestnet, findChainToken } from "./chain-config";

export const BotConfig = {
  AiPrompts: {
    Folder: join(__dirname, "../../ai-prompts"),
  },
  NewsSummaryBot: {
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
    TokenAmountPerAirdrop: 10, // eg: 100 usdt every 24h, total, dispatched between all winning posts

    // Chain related
    Chain: ElastosTestnet,
    Token: findChainToken(ElastosTestnet, "tELA"),
    WalletPrivateKey: process.env.AIRDROP_WALLET_PRIVATE_KEY
  }
}
