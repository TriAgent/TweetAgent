
export type Token = {
  name: string; // eg: "USDTEST"
  symbol: string; // eg: "UTT"
  address: string;
  decimals: number; // token contract decimals encoding - eg: 18 
}

export type Chain = {
  id: string; // unique among all chains
  type: "EVM";
  friendlyName: string; // eg: "Sepolia Testnet"
  chainId: number;
  rpcUrl: string;
  tokens: Token[];
  contracts: {
    airdrop: string;
  };
  explorerTransactionUrl: string;
  explorerWalletUrl: string;
  explorerTokenUrl: string;
}