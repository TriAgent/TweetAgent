
export type Token = {
  name: string; // eg: "USDTEST"
  symbol: string; // eg: "UTT"
  address: string;
  decimals: number; // token contract decimals encoding - eg: 18
}

export type Chain = {
  id: string; // unique among all chains
  type: "EVM";
  chainId: number;
  rpcUrl: string;
  tokens: Token[];
  contracts: {
    airdrop: string;
  };
  explorerTransactionUrl: (transactionId: string) => string;
}

const standardEVMExplorerTransactionUrl = (explorerUrl: string): Chain["explorerTransactionUrl"] => {
  return (transactionId: string) => {
    return `${explorerUrl}/tx/${transactionId}`;
  }
}

export const findChainToken = (chain: Chain, tokenSymbol: string): Token => {
  const token = chain.tokens.find(t => t.symbol === tokenSymbol);
  if (!token)
    throw new Error(`Token with symbol ${tokenSymbol} is not configured for chain ${chain.id}`);

  return token;
}

export const BaseSepolia: Chain = {
  id: "base_sepolia_testnet",
  type: "EVM",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  tokens: [
    { name: "USDTEST", symbol: "UTT", address: "0x58C4e09Fa87a450193928c2a63011d7fcbEae5bb", decimals: 8 }
  ],
  contracts: {
    airdrop: "0xA10580A9863beA50923A587fBda54EFC19184099"
  },
  explorerTransactionUrl: standardEVMExplorerTransactionUrl("https://sepolia.basescan.org")
}

export const SupportedChains = [
  BaseSepolia
]