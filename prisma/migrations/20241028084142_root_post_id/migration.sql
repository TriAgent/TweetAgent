/*
  Warnings:

  - Added the required column `rootPostId` to the `XReply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "XReply" ADD COLUMN     "rootPostId" TEXT NOT NULL;
