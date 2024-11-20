/*
  Warnings:

  - You are about to drop the `ContestAirdropPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContestAirdropPost" DROP CONSTRAINT "ContestAirdropPost_contestAirdropId_fkey";

-- DropForeignKey
ALTER TABLE "ContestAirdropPost" DROP CONSTRAINT "ContestAirdropPost_quotePostId_fkey";

-- DropForeignKey
ALTER TABLE "ContestAirdropPost" DROP CONSTRAINT "ContestAirdropPost_winningXAccountUserId_fkey";

-- DropTable
DROP TABLE "ContestAirdropPost";

-- CreateTable
CREATE TABLE "PostContestAirdrop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contestAirdropId" TEXT NOT NULL,
    "winningXAccountUserId" TEXT NOT NULL,
    "airdropAddress" TEXT NOT NULL,
    "tokenAmount" DECIMAL(65,30) NOT NULL,
    "quotePostId" TEXT NOT NULL,
    "transactionId" TEXT,
    "transferedAt" TIMESTAMP(3),
    "commentCount" INTEGER NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "rtCount" INTEGER NOT NULL,
    "impressionCount" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_id_key" ON "PostContestAirdrop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_contestAirdropId_quotePostId_key" ON "PostContestAirdrop"("contestAirdropId", "quotePostId");

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_contestAirdropId_fkey" FOREIGN KEY ("contestAirdropId") REFERENCES "ContestAirdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_winningXAccountUserId_fkey" FOREIGN KEY ("winningXAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_quotePostId_fkey" FOREIGN KEY ("quotePostId") REFERENCES "XPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
