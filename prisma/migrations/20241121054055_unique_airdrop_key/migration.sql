/*
  Warnings:

  - A unique constraint covering the columns `[contestAirdropId,quotePostId,targetUser]` on the table `PostContestAirdrop` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostContestAirdrop_contestAirdropId_quotePostId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_contestAirdropId_quotePostId_targetUser_key" ON "PostContestAirdrop"("contestAirdropId", "quotePostId", "targetUser");
