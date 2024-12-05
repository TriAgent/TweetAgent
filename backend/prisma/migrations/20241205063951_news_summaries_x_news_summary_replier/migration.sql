/*
  Warnings:

  - The values [NewsSummaries_XNewsSummaryReplier] on the enum `BotFeatureType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BotFeatureType_new" AS ENUM ('Root', 'X_PostsFetcher', 'X_PostsHandler', 'X_PostsSender', 'X_PostsGenericReplier', 'AirdropContest_AirdropSender', 'AirdropContest_AirdropSnapshot', 'AirdropContest_XPostAirdropAddress', 'AirdropContest_XPostContestHandler', 'AirdropContest_XPostContestReposter', 'NewsSummaries_XNewsSummaryWriter', 'NewsSummaries_XRealNewsFilter');
ALTER TABLE "BotFeature" ALTER COLUMN "key" TYPE "BotFeatureType_new" USING ("key"::text::"BotFeatureType_new");
ALTER TYPE "BotFeatureType" RENAME TO "BotFeatureType_old";
ALTER TYPE "BotFeatureType_new" RENAME TO "BotFeatureType";
DROP TYPE "BotFeatureType_old";
COMMIT;
