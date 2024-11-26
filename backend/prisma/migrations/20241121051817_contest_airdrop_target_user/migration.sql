/*
  Warnings:

  - Added the required column `targetUser` to the `PostContestAirdrop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContestAirdropTargetUser" AS ENUM ('Author', 'Mentioner');

-- AlterTable
ALTER TABLE "PostContestAirdrop" ADD COLUMN     "targetUser" "ContestAirdropTargetUser" NOT NULL;
