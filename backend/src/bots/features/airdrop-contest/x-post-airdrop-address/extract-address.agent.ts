import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { BotFeature } from "src/bots/model/bot-feature";
import { aiPromptsService, langchainService } from "src/services";
import { isNullOrUndefined } from "src/utils/is-null-or-undefined";
import { z } from "zod";
import { updateAirdropAddressTool } from "./update-airdrop-address.tool";
import { airdropAddressStateAnnotation } from "./x-post-airdrop-address.feature";

/**
 * Determines if the post is an airdrop address update or not
 */
export const extractAddressAgent = (feature: BotFeature, logger: Logger, post: XPost) => {
  return async (state: typeof airdropAddressStateAnnotation.State) => {
    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchainService().fullyInvoke<{ authorId: string, tweetContent: string }>({
      messages: [
        ["system", await aiPromptsService().get(feature.bot, "airdrop-contest/extract-address")]
      ],
      invocationParams: {
        authorId: post.xAccountUserId,
        tweetContent: post.text
      },
      tools: [
        updateAirdropAddressTool(logger, post)
      ],
      structuredOutput: z.object({
        airdropAddress: z.string().describe("The airdrop blockchain address")
      })
    });

    state.airdropAddress = structuredResponse?.airdropAddress;
    state.isAnAirdropAddressRequest = !isNullOrUndefined(state.airdropAddress);

    if (state.isAnAirdropAddressRequest)
      state.reply = `Thanks, we'll use ${state.airdropAddress} for future airdrops`;

    return state;
  }
};
