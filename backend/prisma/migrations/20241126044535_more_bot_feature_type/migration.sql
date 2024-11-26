/*
  Warnings:

  - The values [AirdropContestAirdropSender] on the enum `BotFeatureType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BotFeatureType_new" AS ENUM ('Core_XPostsFetcher', 'Core_XPostsHandler', 'Core_XPostsSender', 'AirdropContest_AirdropSender', 'AirdropContest_AirdropSnapshot', 'AirdropContest_XPostAirdropAddress', 'AirdropContest_XPostContestHandler', 'AirdropContest_XPostContestReposter', 'NewsSummaries_XNewsSummaryReplier', 'NewsSummaries_XNewsSummaryWriter', 'NewsSummaries_XRealNewsFilter');
ALTER TABLE "BotFeatureConfig" ALTER COLUMN "key" TYPE "BotFeatureType_new" USING ("key"::text::"BotFeatureType_new");
ALTER TYPE "BotFeatureType" RENAME TO "BotFeatureType_old";
ALTER TYPE "BotFeatureType_new" RENAME TO "BotFeatureType";
DROP TYPE "BotFeatureType_old";
COMMIT;
