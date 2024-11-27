/*
  Warnings:

  - A unique constraint covering the columns `[botId,postId]` on the table `XPost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "XPost_botId_postId_key" ON "XPost"("botId", "postId");
