-- CreateEnum
CREATE TYPE "XPostType" AS ENUM ('ThirdPartyNews', 'BotSummary', 'BotReply', 'UserReply');

-- CreateEnum
CREATE TYPE "OperationHistoryType" AS ENUM ('FetchNewsPosts', 'FetchRepliesToSelf');

-- CreateTable
CREATE TABLE "TwitterAccount" (
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userScreeName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessSecret" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "XPost" (
    "id" TEXT NOT NULL,
    "type" "XPostType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentPostId" TEXT,
    "rootPostId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isRealNews" BOOLEAN,
    "summarizedById" TEXT,
    "twitterAccountUserId" TEXT,
    "wasReplyHandled" BOOLEAN NOT NULL DEFAULT false
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

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_userId_key" ON "TwitterAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_id_key" ON "XPost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OperationHistory_id_key" ON "OperationHistory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WebPage_id_key" ON "WebPage"("id");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_summarizedById_fkey" FOREIGN KEY ("summarizedById") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_twitterAccountUserId_fkey" FOREIGN KEY ("twitterAccountUserId") REFERENCES "TwitterAccount"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
