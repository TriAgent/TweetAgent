import { StructuredTool, tool } from "@langchain/core/tools";
import { Logger } from "@nestjs/common";
import { XPost } from "@prisma/client";
import { prisma } from "src/services";
import { z } from "zod";

export const categorizeNewsTool = (logger: Logger, post: XPost): StructuredTool => {
  return tool(
    async ({ text, isNews }: { text: string, isNews: boolean }) => {
      logger.log(`Categorizing tweet as ${isNews ? "REAL NEWS" : "NOT REAL NEWS"}: ${text}`);

      await prisma().xPost.update({
        where: { id: post.id },
        data: { isRealNews: isNews }
      });
    },
    {
      name: "save_categorization",
      description: "Saves categorization of a twitter post as real news or not",
      schema: z.object({
        text: z.string().describe("Textual tweet content"),
        isNews: z.boolean().describe("Whether this tweet can be considered as a real bitcoin news or not")
      })
    })
}