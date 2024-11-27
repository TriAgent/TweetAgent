/*
  Warnings:

  - You are about to drop the column `botAccountUserId` on the `XPost` table. All the data in the column will be lost.
  - You are about to drop the `XPublisherAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `botId` to the `XPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "XPost" DROP CONSTRAINT "XPost_botAccountUserId_fkey";

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "twitterAccessSecret" TEXT,
ADD COLUMN     "twitterAccessToken" TEXT,
ADD COLUMN     "twitterUserId" TEXT,
ADD COLUMN     "twitterUserName" TEXT,
ADD COLUMN     "twitterUserScreenName" TEXT;

-- AlterTable
ALTER TABLE "XPost" DROP COLUMN "botAccountUserId",
ADD COLUMN     "botId" TEXT NOT NULL;

-- DropTable
DROP TABLE "XPublisherAccount";

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
