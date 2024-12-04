/*
  Warnings:

  - Added the required column `botId` to the `ContestAirdrop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContestAirdrop" ADD COLUMN     "botId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ContestAirdrop" ADD CONSTRAINT "ContestAirdrop_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
