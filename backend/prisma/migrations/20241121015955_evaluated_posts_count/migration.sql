/*
  Warnings:

  - Added the required column `evaluatedPostsCount` to the `ContestAirdrop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContestAirdrop" ADD COLUMN     "evaluatedPostsCount" INTEGER NOT NULL;
