import { StructuredTool, tool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { prisma, xAccountsService } from "src/services";
import { z } from "zod";

export const updateAirdropAddressTool = (logger: Logger, post: XPost): StructuredTool => {
  return tool(
    async ({ userId, airdropAddress }: { userId: string, airdropAddress: string }) => {
      if (!userId || !airdropAddress)
        throw new Error(`Post author ID or airdrop address is missing`);

      logger.log(`Updating airdrop address mapping: ${userId} ${airdropAddress}`);

      // Make sure we have base info about this user
      const xAccount = await xAccountsService().ensureXAccount(userId);

      // Update airdrop address
      await prisma().xAccount.update({
        where: { userId: xAccount.userId },
        data: { airdropAddress }
      });
    },
    {
      name: "update_airdrop_address",
      description: "Updates the twitter user id / airdrop address in database",
      schema: z.object({
        userId: z.string().describe("Post author's user id"),
        airdropAddress: z.string().describe("Post author's airdrop address")
      })
    })
}