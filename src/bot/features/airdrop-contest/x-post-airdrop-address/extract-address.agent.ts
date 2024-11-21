import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";
import { isNullOrUndefined } from "src/utils/is-null-or-undefined";
import { z } from "zod";
import { updateAirdropAddressTool } from "./update-airdrop-address.tool";
import { airdropAddressStateAnnotation } from "./x-post-airdrop-address.service";

/**
 * Determines if the post is an airdrop address update or not
 */
export const extractAddressAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof airdropAddressStateAnnotation.State) => {
    const SYSTEM_TEMPLATE = `
      Here is a twitter post from user id '{authorId}'. If you consider that this post provides a blockchain address compatible with the
      'base' blockchain, return the airdrop address and update the user/address map in database. Otherwise, return null.

      Here is the tweet:
      ---------------- 
      {tweetContent}
    `;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke<{ authorId: string, tweetContent: string }>({
      messages: [["system", SYSTEM_TEMPLATE]],
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
