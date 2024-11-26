/*
  Warnings:

  - Changed the type of `key` on the `BotFeatureConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BotFeatureType" AS ENUM ('AirdropContestAirdropSender');

-- AlterTable
ALTER TABLE "BotFeatureConfig" DROP COLUMN "key",
ADD COLUMN     "key" "BotFeatureType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BotFeatureConfig_botId_key_key" ON "BotFeatureConfig"("botId", "key");
