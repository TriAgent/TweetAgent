/*
  Warnings:

  - You are about to drop the column `authorId` on the `XPost` table. All the data in the column will be lost.
  - Added the required column `xAccountUserId` to the `XPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "XPost" DROP COLUMN "authorId",
ADD COLUMN     "xAccountUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_xAccountUserId_fkey" FOREIGN KEY ("xAccountUserId") REFERENCES "XAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
