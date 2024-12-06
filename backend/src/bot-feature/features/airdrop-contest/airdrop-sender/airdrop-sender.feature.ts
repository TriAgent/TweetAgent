import { XPost } from "@prisma/client";
import { BotFeatureGroupType, BotFeatureType, Chain } from "@x-ai-wallet-bot/common";
import { Contract, ContractTransactionReceipt, ContractTransactionResponse, JsonRpcProvider, Wallet } from 'ethers';
import { BotFeature } from "src/bot-feature/model/bot-feature";
import { BotFeatureProvider, BotFeatureProviderConfigBase, DefaultFeatureConfigType } from "src/bot-feature/model/bot-feature-provider";
import { Bot } from "src/bots/model/bot";
import { BotConfig } from "src/config/bot-config";
import { SupportedChains } from "src/config/chain-config";
import { abi as airdropABI } from "src/contracts/TokenBatchTransfer.json";
import { AppLogger } from "src/logs/app-logger";
import { prisma, xPostsService } from "src/services";
import { tokenToContractValue } from "src/utils/tokens";
import { z, infer as zodInfer } from "zod";

// const wallet = Wallet.createRandom();
// console.log('Address:', wallet.address);
// console.log('Private Key:', wallet.privateKey);

const FeatureConfigFormat = BotFeatureProviderConfigBase.extend({
  //snapshotInterval: z.number().describe('Min delay (in seconds) between 2 airdrop snapshots')
}).strict();

type FeatureConfigType = Required<zodInfer<typeof FeatureConfigFormat>>;

export class AirdropSenderProvider extends BotFeatureProvider<AirdropSenderFeature, typeof FeatureConfigFormat> {
  constructor() {
    super(
      BotFeatureGroupType.AirdropContest,
      BotFeatureType.AirdropContest_AirdropSender,
      `On chain transaction sender`,
      `Sends airdrop tokens on chain`,
      FeatureConfigFormat,
      (bot: Bot) => new AirdropSenderFeature(this, bot)
    );
  }

  public getDefaultConfig(): DefaultFeatureConfigType<z.infer<typeof FeatureConfigFormat>> {
    return {
      enabled: false,
      //snapshotInterval: 24 * 60 * 60 // 1 per day
    }
  }
}

/**
 * This feature sends airdrop snapshots to destination addresses on chain.
 */
export class AirdropSenderFeature extends BotFeature<FeatureConfigType> {
  private logger = new AppLogger("AirdropSender", this.bot);
  private rpcProvider: JsonRpcProvider;
  private wallet: Wallet;
  private airdropContract: Contract;

  constructor(provider: BotFeatureProvider<AirdropSenderFeature, typeof FeatureConfigFormat>, bot: Bot) {
    super(provider, bot, 10);

    this.rpcProvider = new JsonRpcProvider(BotConfig.AirdropContest.Chain.rpcUrl);
    this.wallet = new Wallet(BotConfig.AirdropContest.WalletPrivateKey, this.rpcProvider);
    this.airdropContract = new Contract(BotConfig.AirdropContest.Chain.contracts.airdrop, airdropABI, this.wallet);
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

    this.logger.log(`Checking if tokens have to be sent on chain for airdrop ${unsentAirdrop.id}, ${unsentAirdrop.totalTokenAmount} total tokens`);

    // Get the list of unsent packets for this airdrop (could have crashed in the middle)
    const postAirdrops = await prisma().postContestAirdrop.findMany({
      where: {
        contestAirdropId: unsentAirdrop.id,
        transferedAt: null,
        shouldSendOnChain: true
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
        // Depending on target token, use native or ERC20.
        let tx: ContractTransactionResponse;
        if (token.address)
          tx = await this.airdropContract.batchTransfer(airdropAddresses, airdropAmounts);
        else
          tx = await this.airdropContract.batchTransferNative(airdropAddresses, airdropAmounts);

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
    const transactionUrl = chain.explorerTransactionUrl.replace("{transaction}", transactionId);
    const text = `Just sent you a few tokens to thank you for this contribution. Transaction can be found here: ${transactionUrl}`;

    await xPostsService().createPost(this.bot.dbBot, this.bot.dbBot.twitterUserId, text, {
      parentPostId: mentioningPost.postId,
      isSimulated: mentioningPost.isSimulated,
      publishRequestAt: new Date()
    });
  }
}
