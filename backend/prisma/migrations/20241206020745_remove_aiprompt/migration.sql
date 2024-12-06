/*
  Warnings:

  - You are about to drop the `AIPrompt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIPrompt" DROP CONSTRAINT "AIPrompt_botId_fkey";

-- DropTable
DROP TABLE "AIPrompt";
