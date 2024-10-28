/*
  Warnings:

  - Added the required column `accessSecret` to the `TwitterAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessToken` to the `TwitterAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TwitterAccount" ADD COLUMN     "accessSecret" TEXT NOT NULL,
ADD COLUMN     "accessToken" TEXT NOT NULL;
