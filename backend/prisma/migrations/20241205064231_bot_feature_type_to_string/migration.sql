/*
  Warnings:

  - You are about to drop the column `key` on the `BotFeature` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[botId,type]` on the table `BotFeature` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `BotFeature` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BotFeature_botId_key_key";

-- AlterTable
ALTER TABLE "BotFeature" DROP COLUMN "key",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BotFeatureType";

-- CreateIndex
CREATE UNIQUE INDEX "BotFeature_botId_type_key" ON "BotFeature"("botId", "type");
