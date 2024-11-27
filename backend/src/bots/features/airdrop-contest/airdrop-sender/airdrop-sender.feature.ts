import { Logger } from "@nestjs/common";
import { BotFeatureType, XPost } from "@prisma/client";
import { Contract, ContractTransactionReceipt, ContractTransactionResponse, JsonRpcProvider, Wallet } from 'ethers';
import { Bot } from "src/bots/model/bot";
import { BotFeature } from "src/bots/model/bot-feature";
import { BotConfig } from "src/config/bot-config";
import { Chain, SupportedChains } from "src/config/chain-config";
import airdropABI from "src/contracts/airdrop.json";
import { prisma } from "src/services";
import { tokenToContractValue } from "src/utils/tokens";

// const wallet = Wallet.createRandom();
// console.log('Address:', wallet.address);
// console.log('Private Key:', wallet.privateKey);

/**
 * This feature sends airdrop snapshots to destination addresses on chain.
 */
export class AirdropSenderFeature extends BotFeature {
  private logger = new Logger("AirdropSender");
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private airdropContract: Contract;

  constructor(bot: Bot) {
    super(BotFeatureType.AirdropContest_AirdropSender, bot, 10);

    this.provider = new JsonRpcProvider(BotConfig.AirdropContest.Chain.rpcUrl);
    this.wallet = new Wallet(BotConfig.AirdropContest.WalletPrivateKey, this.provider);
    this.airdropContract = new Contract(BotConfig.AirdropContest.Chain.contracts.airdrop, airdropABI, this.wallet);
  }

  public isEnabled(): boolean {
    return BotConfig.AirdropContest.IsActive;
  }

  async scheduledExecution() {
    // Find the most recent untransfered airdrop. We start by the most recent to make sure we continue sending
    // recent airdrops in case a older one has problems, so we don't retry it foxrever and get stuck.
    const unsentAirdrop = await prisma().contestAirdrop.findFirst({
      where: {
        transferedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    if (!unsentAirdrop)
      return; // Nothing to airdrop for now

    this.logger.log(`Sending tokens on chain for airdrop ${unsentAirdrop.id}, ${unsentAirdrop.totalTokenAmount} total tokens`);

    // Get the list of unsent packets for this airdrop (could have crashed in the middle)
    const postAirdrops = await prisma().postContestAirdrop.findMany({
      where: {
        contestAirdropId: unsentAirdrop.id,
        transferedAt: null
      },
      include: {
        quotePost: {
          include: {
            contestQuotedPost: {
              include: {
                contestMentioningPost: true
              }
            }
          }
        }
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
    await prisma().$transaction([
      prisma().postContestAirdrop.updateMany({
        where: { id: { in: postAirdropsIds } },
        data: { transferedAt }
      }),
      prisma().contestAirdrop.update({
        where: { id: unsentAirdrop.id },
        data: { transferedAt }
      })
    ])

    if (postAirdrops.length > 0) {
      // Send tokens on chain
      try {
        const tx: ContractTransactionResponse = await this.airdropContract.batchTransfer(airdropAddresses, airdropAmounts);
        this.logger.log(`Publishing transaction on chain. Transaction ID: ${tx?.hash}`);

        // Wait for block confirmation
        const response: ContractTransactionReceipt = await tx?.wait();
        this.logger.log(`Transaction sent`);

        // Save transaction IDs
        const transactionId = tx.hash;
        await prisma().postContestAirdrop.updateMany({
          where: { id: { in: postAirdropsIds } },
          data: { transactionId }
        });

        // Let mentioners know they got an airdrop by replying to their initial post.
        this.logger.log(`Scheduling X posts to let winners know they get an airdrop`);
        for (const postAirdrop of postAirdrops) {
          const mentioningPost = postAirdrop.quotePost.contestQuotedPost.contestMentioningPost;
          await this.sendAirdroppedReply(mentioningPost, chain, transactionId);
        }
      }
      catch (e) {
        const reason: string = e.reason;
        if (reason?.includes(`transfer amount exceeds balance`)) {
          this.logger.error(`Failed to send airdrop tokens, not enough tokens in airdrop contract. Send more ${token.symbol} tokens to contract at ${BotConfig.AirdropContest.Chain.contracts.airdrop}.`)
        }
        else
          this.logger.error(e);
      }
    }
  }

  private async sendAirdroppedReply(mentioningPost: XPost, chain: Chain, transactionId: string) {
    const transactionUrl = chain.explorerTransactionUrl(transactionId);
    const text = `Just sent you a few tokens to thank you for this contribution. Transaction can be found here: ${transactionUrl}`;

    await prisma().xPost.create({
      data: {
        publishRequestAt: new Date(),
        text,
        xAccount: { connect: { userId: this.bot.dbBot.twitterUserId } },
        bot: { connect: { id: this.bot.dbBot.id } },
        parentPostId: mentioningPost.postId,
      }
    });
  }
}
