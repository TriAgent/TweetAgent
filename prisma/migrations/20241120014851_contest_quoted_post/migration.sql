/*
  Warnings:

  - A unique constraint covering the columns `[contestQuotedPostId]` on the table `XPost` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "XPost" ADD COLUMN     "contestQuotedPostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "XPost_contestQuotedPostId_key" ON "XPost"("contestQuotedPostId");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_contestQuotedPostId_fkey" FOREIGN KEY ("contestQuotedPostId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
