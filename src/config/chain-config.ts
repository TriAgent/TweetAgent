export type Token = {
  name: string;
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
  }
}

export const BaseSepolia: Chain = {
  id: "base_sepolia_testnet",
  type: "EVM",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  tokens: [
    { name: "USDT", address: "0x74D8f222D3b8c173C24aD188f6B538159eE0F270", decimals: 18 } // TODO - WRONG
  ],
  contracts: {
    airdrop: "0x1414Ce5b17C8d03564F39D56e248B063e3aC5174" // TODO - WRONG
  }
}

export const SupportedChains = [
  BaseSepolia
]