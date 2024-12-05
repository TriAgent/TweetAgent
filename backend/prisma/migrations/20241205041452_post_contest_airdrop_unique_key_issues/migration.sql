/*
  Warnings:

  - A unique constraint covering the columns `[quotePostId,winningXAccountUserId,airdropAddress,targetUser]` on the table `PostContestAirdrop` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostContestAirdrop_contestAirdropId_quotePostId_winningXAcc_key";

-- DropIndex
DROP INDEX "PostContestAirdrop_quotePostId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_quotePostId_winningXAccountUserId_airdro_key" ON "PostContestAirdrop"("quotePostId", "winningXAccountUserId", "airdropAddress", "targetUser");
