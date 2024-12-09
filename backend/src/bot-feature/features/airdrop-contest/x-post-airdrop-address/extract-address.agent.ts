import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { isNullOrUndefined } from "@x-ai-wallet-bot/common";
import { BotConfig } from "src/config/bot-config";
import { langchainService } from "src/services";
import { z } from "zod";
import { updateAirdropAddressTool } from "./update-airdrop-address.tool";
import { airdropAddressStateAnnotation, XPostAirdropAddressFeature } from "./x-post-airdrop-address.feature";

/**
 * Determines if the post is an airdrop address update or not
 */
export const extractAddressAgent = (feature: XPostAirdropAddressFeature, logger: Logger, post: XPost) => {
  return async (state: typeof airdropAddressStateAnnotation.State) => {
    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchainService().fullyInvoke<{ authorId: string, tweetContent: string, chain: string }>({
      messages: [
        ["system", feature.config._prompts.extractAddress]
      ],
      invocationParams: {
        authorId: post.xAccountUserId,
        tweetContent: post.text,
        chain: BotConfig.AirdropContest.Chain.friendlyName
      },
      tools: [
        updateAirdropAddressTool(feature, logger, post)
      ],
      structuredOutput: z.object({
        airdropAddress: z.string().describe("The airdrop blockchain address, or null if no valid address found")
      })
    });

    state.airdropAddress = structuredResponse?.airdropAddress;
    if (state.airdropAddress === "null")
      state.airdropAddress = null; // LLM returns a "null" string
    state.isAnAirdropAddressRequest = !isNullOrUndefined(state.airdropAddress);

    if (state.isAnAirdropAddressRequest)
      state.reply = `Thanks, we'll use ${state.airdropAddress} for future airdrops`;

    return state;
  }
};
