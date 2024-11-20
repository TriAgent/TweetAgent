/*
  Warnings:

  - You are about to drop the `ContestAirdropToAddress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContestAirdropToAddress" DROP CONSTRAINT "ContestAirdropToAddress_contestAirdropId_fkey";

-- DropForeignKey
ALTER TABLE "ContestAirdropToAddress" DROP CONSTRAINT "ContestAirdropToAddress_quotePostId_fkey";

-- DropForeignKey
ALTER TABLE "ContestAirdropToAddress" DROP CONSTRAINT "ContestAirdropToAddress_winningXAccountUserId_fkey";

-- DropTable
DROP TABLE "ContestAirdropToAddress";

-- CreateTable
CREATE TABLE "ContestAirdropPost" (
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
CREATE UNIQUE INDEX "ContestAirdropPost_id_key" ON "ContestAirdropPost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestAirdropPost_contestAirdropId_quotePostId_key" ON "ContestAirdropPost"("contestAirdropId", "quotePostId");

-- AddForeignKey
ALTER TABLE "ContestAirdropPost" ADD CONSTRAINT "ContestAirdropPost_contestAirdropId_fkey" FOREIGN KEY ("contestAirdropId") REFERENCES "ContestAirdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAirdropPost" ADD CONSTRAINT "ContestAirdropPost_winningXAccountUserId_fkey" FOREIGN KEY ("winningXAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAirdropPost" ADD CONSTRAINT "ContestAirdropPost_quotePostId_fkey" FOREIGN KEY ("quotePostId") REFERENCES "XPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
