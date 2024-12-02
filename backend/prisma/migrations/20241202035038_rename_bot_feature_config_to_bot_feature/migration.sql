/*
  Warnings:

  - You are about to drop the `BotFeatureConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BotFeatureConfig" DROP CONSTRAINT "BotFeatureConfig_botId_fkey";

-- DropTable
DROP TABLE "BotFeatureConfig";

-- CreateTable
CREATE TABLE "BotFeature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "key" "BotFeatureType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}'
);

-- CreateIndex
CREATE UNIQUE INDEX "BotFeature_id_key" ON "BotFeature"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BotFeature_botId_key_key" ON "BotFeature"("botId", "key");

-- AddForeignKey
ALTER TABLE "BotFeature" ADD CONSTRAINT "BotFeature_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
