import { Injectable, Logger } from "@nestjs/common";
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { BotFeature } from "src/bot/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { SupportedChains } from "src/config/chain-config";
import { PrismaService } from "src/prisma/prisma.service";
import { tokenToContractValue } from "src/utils/tokens";

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

    // TODO: load ABI from assets
    const abi = [
      'function airdrop(address[] calldata recipients, uint256[] calldata amounts) external'
    ];

    this.provider = new JsonRpcProvider(BotConfig.AirdropContest.Chain.rpcUrl);
    this.wallet = new Wallet(BotConfig.AirdropContest.WalletPrivateKey, this.provider);
    this.airdropContract = new Contract(BotConfig.AirdropContest.Chain.contracts.airdrop, abi, this.wallet);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // Find the most recent untransfered airdrop. We start by the most recent to make sure we continue sending
    // recent airdrops in case a older one has problems, so we don't retry it foxrever and get stuck.
    const unsentAirdrop = await this.prisma.contestAirdrop.findFirst({
      where: {
        transferedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    if (!unsentAirdrop)
      return; // Nothing to airdrop for now

    this.logger.log(`Sending tokens on chain for airdrop ${unsentAirdrop.id}, ${unsentAirdrop.totalTokenAmount} total tokens`);

    // Get the list of unsent packets for this airdrop (could have crashed in the middle)
    const postAirdrops = await this.prisma.postContestAirdrop.findMany({
      where: {
        contestAirdropId: unsentAirdrop.id,
        transferedAt: null
      }
    });
    const postAirdropsIds = postAirdrops.map(pa => pa.id);

    this.logger.log(`${postAirdrops.length} posts in this airdrop`);

    const chain = SupportedChains.find(c => c.id === unsentAirdrop.chain);
    if (!chain)
      throw new Error(`Chain ${unsentAirdrop.chain} not configured to send a scheduled airdrop!`);

    const token = chain.tokens.find(t => t.address === unsentAirdrop.tokenAddress);
    if (!token)
      throw new Error(`Token ${unsentAirdrop.tokenAddress} not configured to send a scheduled airdrop!`);

    const airdropAddresses = postAirdrops.map(pa => pa.airdropAddress);
    const airdropAmounts = postAirdrops.map(pa => tokenToContractValue(pa.tokenAmount.toString(), token.decimals).toString());

    // Mark entries as transfered even before the transfer, so we don't transfer again in case of lack of API
    // response (could hve been sent). Better not sending than sending double/triple...
    // Later on we can manually check items that have a transfer date but no transaction ID, meaning something weird
    // happened.
    const transferedAt = new Date();
    await this.prisma.$transaction([
      this.prisma.postContestAirdrop.updateMany({
        where: { id: { in: postAirdropsIds } },
        data: { transferedAt }
      }),
      this.prisma.contestAirdrop.update({
        where: { id: unsentAirdrop.id },
        data: { transferedAt }
      })
    ])

    // Send tokens on chai
    const tx = await this.airdropContract.airdrop(airdropAddresses, airdropAmounts);
    await tx.wait();

    // Save transaction IDs
    await this.prisma.postContestAirdrop.updateMany({
      where: { id: { in: postAirdropsIds } },
      data: {
        transactionId: tx.transactionHash
      }
    });
  }
}
