/*
  Warnings:

  - You are about to drop the column `parentPostId` on the `XReply` table. All the data in the column will be lost.
  - You are about to drop the column `rootPostId` on the `XReply` table. All the data in the column will be lost.
  - Added the required column `isNewsPost` to the `XPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPostId` to the `XPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rootPostId` to the `XPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "XPost" ADD COLUMN     "isNewsPost" BOOLEAN NOT NULL,
ADD COLUMN     "parentPostId" TEXT NOT NULL,
ADD COLUMN     "rootPostId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "XReply" DROP COLUMN "parentPostId",
DROP COLUMN "rootPostId";
