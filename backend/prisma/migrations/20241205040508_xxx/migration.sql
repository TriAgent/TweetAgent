/*
  Warnings:

  - A unique constraint covering the columns `[contestAirdropId,quotePostId,winningXAccountUserId,airdropAddress,targetUser]` on the table `PostContestAirdrop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_contestAirdropId_quotePostId_winningXAcc_key" ON "PostContestAirdrop"("contestAirdropId", "quotePostId", "winningXAccountUserId", "airdropAddress", "targetUser");
