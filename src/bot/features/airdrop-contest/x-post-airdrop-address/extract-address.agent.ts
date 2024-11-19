import { StructuredTool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { langchain } from "src/services";
import { z } from "zod";
import { updateAirdropAddressTool } from "./update-airdrop-address.tool";
import { airdropAddressStateAnnotation } from "./x-post-airdrop-address.service";

/**
 * Determines if the post is an airdrop address update or not
 */
export const extractAddressAgent = (logger: Logger, post: XPost) => {
  return async (state: typeof airdropAddressStateAnnotation.State) => {
    const tools: StructuredTool[] = [
      updateAirdropAddressTool(logger, post)
    ];

    const structuredOutput = z.object({
      airdropAddress: z.string().describe("The airdrop blockchain address")
    });

    const SYSTEM_TEMPLATE = `
      Here is a twitter post from user id '{authorId}'. If you consider that this post provides a blockchain address compatible with the
      'base' blockchain, return the airdrop address and update the user/address map in database. Otherwise, return null.

      Here is the tweet:
      ---------------- 
      {tweetContent}
    `;

    // Invoke command, execute all tools, and get structured json response.
    const { structuredResponse } = await langchain().fullyInvoke(
      [
        ["system", SYSTEM_TEMPLATE]
      ],
      { authorId: post.authorId, tweetContent: post.text },
      tools,
      structuredOutput
    );

    state.airdropAddress = structuredResponse?.airdropAddress;
    state.isAnAirdropAddressRequest = state.airdropAddress !== undefined;

    if (state.isAnAirdropAddressRequest)
      state.reply = `Thanks, we'll use ${state.airdropAddress} for future airdrops`;

    return state;
  }
};
