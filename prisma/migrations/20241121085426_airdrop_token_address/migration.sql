/*
  Warnings:

  - You are about to drop the column `token` on the `ContestAirdrop` table. All the data in the column will be lost.
  - Added the required column `tokenAddress` to the `ContestAirdrop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContestAirdrop" DROP COLUMN "token",
ADD COLUMN     "tokenAddress" TEXT NOT NULL;
