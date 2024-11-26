/*
  Warnings:

  - You are about to drop the column `publisherAccountUserId` on the `XPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "XPost" DROP CONSTRAINT "XPost_publisherAccountUserId_fkey";

-- AlterTable
ALTER TABLE "XPost" DROP COLUMN "publisherAccountUserId",
ADD COLUMN     "botAccountUserId" TEXT;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_botAccountUserId_fkey" FOREIGN KEY ("botAccountUserId") REFERENCES "XPublisherAccount"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
