-- CreateEnum
CREATE TYPE "OperationHistoryType" AS ENUM ('FetchAccountsPosts', 'FetchPostsWeAreMentionnedIn');

-- CreateEnum
CREATE TYPE "ContestAirdropTargetUser" AS ENUM ('Author', 'Mentioner');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('Debug', 'Log', 'Warning', 'Error');

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'Bot',
    "twitterUserId" TEXT,
    "twitterUserName" TEXT,
    "twitterUserScreenName" TEXT,
    "twitterAccessToken" TEXT,
    "twitterAccessSecret" TEXT
);

-- CreateTable
CREATE TABLE "BotFeature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "XAccount" (
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userScreenName" TEXT NOT NULL,
    "airdropAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "XPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishRequestAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "botId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "postId" TEXT,
    "parentPostId" TEXT,
    "quotedPostId" TEXT,
    "xAccountUserId" TEXT NOT NULL,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "isRealNews" BOOLEAN,
    "summarizedById" TEXT,
    "wasReplyHandled" BOOLEAN NOT NULL DEFAULT false,
    "worthForAirdropContest" BOOLEAN,
    "quotedForAirdropContestAt" TIMESTAMP(3),
    "contestMentioningPostId" TEXT,
    "contestQuotedPostId" TEXT
);

-- CreateTable
CREATE TABLE "OperationHistory" (
    "id" TEXT NOT NULL,
    "type" "OperationHistoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WebPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentDate" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "ContestAirdrop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferedAt" TIMESTAMP(3),
    "botId" TEXT NOT NULL,
    "totalTokenAmount" DECIMAL(65,30) NOT NULL,
    "chain" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "evaluatedPostsCount" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PostContestAirdrop" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contestAirdropId" TEXT NOT NULL,
    "winningXAccountUserId" TEXT NOT NULL,
    "airdropAddress" TEXT NOT NULL,
    "tokenAmount" DECIMAL(65,30) NOT NULL,
    "quotePostId" TEXT NOT NULL,
    "targetUser" "ContestAirdropTargetUser" NOT NULL,
    "shouldSendOnChain" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" TEXT,
    "transferedAt" TIMESTAMP(3),
    "commentCount" INTEGER NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "rtCount" INTEGER NOT NULL,
    "impressionCount" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "message" TEXT,
    "json" JSONB,
    "botId" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_id_key" ON "Bot"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BotFeature_id_key" ON "BotFeature"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BotFeature_botId_type_key" ON "BotFeature"("botId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "XAccount_userId_key" ON "XAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_id_key" ON "XPost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_contestMentioningPostId_key" ON "XPost"("contestMentioningPostId");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_contestQuotedPostId_key" ON "XPost"("contestQuotedPostId");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_botId_postId_key" ON "XPost"("botId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationHistory_id_key" ON "OperationHistory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WebPage_id_key" ON "WebPage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContestAirdrop_id_key" ON "ContestAirdrop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_id_key" ON "PostContestAirdrop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PostContestAirdrop_quotePostId_winningXAccountUserId_airdro_key" ON "PostContestAirdrop"("quotePostId", "winningXAccountUserId", "airdropAddress", "targetUser");

-- AddForeignKey
ALTER TABLE "BotFeature" ADD CONSTRAINT "BotFeature_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_xAccountUserId_fkey" FOREIGN KEY ("xAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_summarizedById_fkey" FOREIGN KEY ("summarizedById") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_contestMentioningPostId_fkey" FOREIGN KEY ("contestMentioningPostId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_contestQuotedPostId_fkey" FOREIGN KEY ("contestQuotedPostId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestAirdrop" ADD CONSTRAINT "ContestAirdrop_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_contestAirdropId_fkey" FOREIGN KEY ("contestAirdropId") REFERENCES "ContestAirdrop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_winningXAccountUserId_fkey" FOREIGN KEY ("winningXAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContestAirdrop" ADD CONSTRAINT "PostContestAirdrop_quotePostId_fkey" FOREIGN KEY ("quotePostId") REFERENCES "XPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
