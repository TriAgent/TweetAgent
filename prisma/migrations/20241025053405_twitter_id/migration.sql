/*
  Warnings:

  - You are about to drop the column `id` on the `TwitterAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `TwitterAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TwitterAccount_id_key";

-- AlterTable
ALTER TABLE "TwitterAccount" DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_userId_key" ON "TwitterAccount"("userId");
