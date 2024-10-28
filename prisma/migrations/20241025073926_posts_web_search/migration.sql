-- CreateTable
CREATE TABLE "WebPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentDate" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "XPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "contentDate" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "XPostRetrievals" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newPostsCount" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WebPage_id_key" ON "WebPage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "XPost_id_key" ON "XPost"("id");

-- CreateIndex
CREATE UNIQUE INDEX "XPostRetrievals_id_key" ON "XPostRetrievals"("id");
