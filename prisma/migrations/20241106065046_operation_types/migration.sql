/*
  Warnings:

  - The values [FetchNewsPosts,FetchRepliesToSelf,FetchContestBotMentionPosts] on the enum `OperationHistoryType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `XPost` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OperationHistoryType_new" AS ENUM ('FetchAccountsPosts', 'FetchPostsWeAreMentionnedIn');
ALTER TABLE "OperationHistory" ALTER COLUMN "type" TYPE "OperationHistoryType_new" USING ("type"::text::"OperationHistoryType_new");
ALTER TYPE "OperationHistoryType" RENAME TO "OperationHistoryType_old";
ALTER TYPE "OperationHistoryType_new" RENAME TO "OperationHistoryType";
DROP TYPE "OperationHistoryType_old";
COMMIT;

-- AlterTable
ALTER TABLE "XPost" DROP COLUMN "type";

-- DropEnum
DROP TYPE "XPostType";
