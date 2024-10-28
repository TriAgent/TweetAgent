-- AlterTable
ALTER TABLE "XPost" ADD COLUMN     "postedXPostId" TEXT;

-- CreateTable
CREATE TABLE "PostedXPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "text" TEXT NOT NULL,
    "twitterAccountUserId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PostedXPost_id_key" ON "PostedXPost"("id");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_postedXPostId_fkey" FOREIGN KEY ("postedXPostId") REFERENCES "PostedXPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostedXPost" ADD CONSTRAINT "PostedXPost_twitterAccountUserId_fkey" FOREIGN KEY ("twitterAccountUserId") REFERENCES "TwitterAccount"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
