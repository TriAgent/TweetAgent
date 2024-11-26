-- CreateTable
CREATE TABLE "ContestAirdrop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalTokenAmount" DECIMAL(65,30) NOT NULL,
    "token" TEXT NOT NULL,
    "chain" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContestAirdropToAddress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contestAirdropId" TEXT NOT NULL,
    "winningXAccountUserId" TEXT NOT NULL,
    "airdropAddress" TEXT NOT NULL,
    "tokenAmount" DECIMAL(65,30) NOT NULL,
    "quotePostId" TEXT NOT NULL,
    "transactionId" TEXT,
    "transferedAt" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestAirdrop_id_key" ON "ContestAirdrop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestAirdropToAddress_id_key" ON "ContestAirdropToAddress"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestAirdropToAddress_contestAirdropId_quotePostId_key" ON "ContestAirdropToAddress"("contestAirdropId", "quotePostId");

-- AddForeignKey
ALTER TABLE "ContestAirdropToAddress" ADD CONSTRAINT "ContestAirdropToAddress_contestAirdropId_fkey" FOREIGN KEY ("contestAirdropId") REFERENCES "ContestAirdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAirdropToAddress" ADD CONSTRAINT "ContestAirdropToAddress_winningXAccountUserId_fkey" FOREIGN KEY ("winningXAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAirdropToAddress" ADD CONSTRAINT "ContestAirdropToAddress_quotePostId_fkey" FOREIGN KEY ("quotePostId") REFERENCES "XPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
