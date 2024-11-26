/*
  Warnings:

  - You are about to drop the column `twitterAccountUserId` on the `XPost` table. All the data in the column will be lost.
  - You are about to drop the `TwitterAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "XPost" DROP CONSTRAINT "XPost_twitterAccountUserId_fkey";

-- AlterTable
ALTER TABLE "XPost" DROP COLUMN "twitterAccountUserId",
ADD COLUMN     "publisherAccountUserId" TEXT;

-- DropTable
DROP TABLE "TwitterAccount";

-- CreateTable
CREATE TABLE "XPublisherAccount" (
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userScreenName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessSecret" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "XAccount" (
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userScreenName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "XPublisherAccount_userId_key" ON "XPublisherAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XAccount_userId_key" ON "XAccount"("userId");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_publisherAccountUserId_fkey" FOREIGN KEY ("publisherAccountUserId") REFERENCES "XPublisherAccount"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
