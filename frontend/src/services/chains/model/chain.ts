import { Chain as ChainDTO, Token } from "@x-ai-wallet-bot/common";
import { Expose } from "class-transformer";

export class Chain implements ChainDTO {
  @Expose() id: string;
  @Expose() friendlyName: string;
  @Expose() type: "EVM";
  @Expose() chainId: number;
  @Expose() rpcUrl: string;
  @Expose() tokens: Token[];
  @Expose() contracts: { airdrop: string; };
  @Expose() explorerTransactionUrl: string;
  @Expose() explorerWalletUrl: string;
  @Expose() explorerTokenUrl: string;
}