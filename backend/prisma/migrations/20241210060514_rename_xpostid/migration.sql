/*
  Warnings:

  - You are about to drop the column `xPostId` on the `DebugComment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DebugComment" DROP CONSTRAINT "DebugComment_xPostId_fkey";

-- AlterTable
ALTER TABLE "DebugComment" DROP COLUMN "xPostId",
ADD COLUMN     "postId" TEXT;

-- AddForeignKey
ALTER TABLE "DebugComment" ADD CONSTRAINT "DebugComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
