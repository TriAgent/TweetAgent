import { Chain, Token } from "@x-ai-wallet-bot/common";

export const findChainToken = (chain: Chain, tokenSymbol: string): Token => {
  const token = chain.tokens.find(t => t.symbol === tokenSymbol);
  if (!token)
    throw new Error(`Token with symbol ${tokenSymbol} is not configured for chain ${chain.id}`);

  return token;
}

export const BaseSepolia: Chain = {
  id: "base_sepolia_testnet",
  friendlyName: "Sepolia Testnet",
  type: "EVM",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  tokens: [
    { name: "USDTEST", symbol: "UTT", address: "0x58C4e09Fa87a450193928c2a63011d7fcbEae5bb", decimals: 8 }
  ],
  contracts: {
    airdrop: "0xA10580A9863beA50923A587fBda54EFC19184099"
  },
  explorerTransactionUrl: "https://sepolia.basescan.org/tx/{transaction}",
  explorerWalletUrl: "https://sepolia.basescan.org/address/{walletAddress}",
  explorerTokenUrl: "https://sepolia.basescan.org/token/{tokenAddress}"
}

export const SupportedChains = [
  BaseSepolia
]