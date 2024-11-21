/*
  Warnings:

  - A unique constraint covering the columns `[quotePostId]` on the table `PostContestAirdrop` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contestMentioningPostId]` on the table `XPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "XPost" ADD COLUMN     "contestMentioningPostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_quotePostId_key" ON "PostContestAirdrop"("quotePostId");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_contestMentioningPostId_key" ON "XPost"("contestMentioningPostId");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_contestMentioningPostId_fkey" FOREIGN KEY ("contestMentioningPostId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
