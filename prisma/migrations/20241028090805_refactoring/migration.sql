/*
  Warnings:

  - You are about to drop the `XPostRetrievals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `XReplyRetrievals` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OperationHistoryType" AS ENUM ('FetchNewsPosts', 'FetchRepliesToSelf');

-- DropTable
DROP TABLE "XPostRetrievals";

-- DropTable
DROP TABLE "XReplyRetrievals";

-- CreateTable
CREATE TABLE "OperationHistory" (
    "id" TEXT NOT NULL,
    "type" "OperationHistoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationHistory_id_key" ON "OperationHistory"("id");
