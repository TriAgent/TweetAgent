import { Injectable, Logger } from "@nestjs/common";
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { PrismaService } from "src/prisma/prisma.service";

/**
 * This feature sends airdrop snapshots to destination addresses on chain.
 */
@Injectable()
export class AirdropSenderService extends BotFeature {
  private logger = new Logger("AirdropSender");
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private airdropContract: Contract;

  constructor(private prisma: PrismaService) {
    super(10);

    const rpcUrl = 'https://base-rpc-url';
    const privateKey = 'YOUR_PRIVATE_KEY';
    const contractAddress = 'AIR_DROP_CONTRACT_ADDRESS';
    const abi = [
      'function airdrop(address[] calldata recipients, uint256[] calldata amounts) external'
    ];

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
    this.airdropContract = new Contract(contractAddress, abi, this.wallet);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // const tx = await this.airdropContract.airdrop(recipients, amounts);
    // await tx.wait();
  }
}

/*
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;

  contract Airdrop {
      address public owner;
      IERC20 public token;

      modifier onlyOwner() {
          require(msg.sender == owner, "Not the owner");
          _;
      }

      constructor(IERC20 _token) {
          owner = msg.sender;
          token = _token;
      }

      function airdrop(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
          require(recipients.length == amounts.length, "Mismatched arrays");
          for (uint256 i = 0; i < recipients.length; i++) {
              token.transfer(recipients[i], amounts[i]);
          }
      }
  }

  interface IERC20 {
      function transfer(address recipient, uint256 amount) external returns (bool);
  }
*/