-- AlterTable
ALTER TABLE "XPost" ALTER COLUMN "publishedAt" DROP NOT NULL,
ALTER COLUMN "postId" DROP NOT NULL,
ALTER COLUMN "rootPostId" DROP NOT NULL;
