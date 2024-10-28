-- CreateTable
CREATE TABLE "XReply" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "contentDate" TIMESTAMP(3) NOT NULL,
    "parentPostId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "XReplyRetrievals" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "XReply_id_key" ON "XReply"("id");

-- CreateIndex
CREATE UNIQUE INDEX "XReplyRetrievals_id_key" ON "XReplyRetrievals"("id");
