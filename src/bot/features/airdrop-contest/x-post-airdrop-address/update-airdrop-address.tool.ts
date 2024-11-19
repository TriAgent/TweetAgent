import { StructuredTool, tool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { z } from "zod";

export const updateAirdropAddressTool = (logger: Logger, post: XPost): StructuredTool => {
  return tool(
    async ({ userId, airdropAddress }: { userId: string, airdropAddress: string }) => {
      if (!userId || !airdropAddress)
        throw new Error(`Post author ID or airdrop address is missing`);

      logger.log(`Updating airdrop mapping: ${userId} ${airdropAddress}`);

      // TODO
      // await prisma.xPost.update({
      //   where: { id: post.id },
      //   data: { isRealNews: isNews }
      // });
    },
    {
      name: "update_aidrop_address",
      description: "Updates the twitter user id / airdrop address in database",
      schema: z.object({
        userId: z.string().describe("Post author's user id"),
        airdropAddress: z.string().describe("Post author's airdrop address")
      })
    })
}