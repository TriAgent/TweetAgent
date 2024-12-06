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
    airdrop: "0xA10580A9863beA50923A587fBda54EFC19184099" // supports ERC20, not native
  },
  explorerTransactionUrl: "https://sepolia.basescan.org/tx/{transaction}",
  explorerWalletUrl: "https://sepolia.basescan.org/address/{walletAddress}",
  explorerTokenUrl: "https://sepolia.basescan.org/token/{tokenAddress}"
}

export const ElastosTestnet: Chain = {
  id: "elastos_testnet",
  friendlyName: "Elastos Testnet",
  type: "EVM",
  chainId: 21,
  rpcUrl: "https://api-testnet.elastos.io/eth",
  tokens: [
    { name: "tELA", symbol: "tELA", address: null, decimals: 18 }
  ],
  contracts: {
    airdrop: "0x64225FCa2c978b926413b87158b97D600Fb4ea03" // supports ERC20 and native
  },
  explorerTransactionUrl: "https://esc-testnet.elastos.io/tx/{transaction}",
  explorerWalletUrl: "https://esc-testnet.elastos.io/address/{walletAddress}",
  explorerTokenUrl: "https://esc-testnet.elastos.io/token/{tokenAddress}"
}

export const SupportedChains = [
  BaseSepolia,
  ElastosTestnet
]