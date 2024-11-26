/*
  Warnings:

  - A unique constraint covering the columns `[key,botId]` on the table `AIPrompt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AIPrompt_key_botId_key" ON "AIPrompt"("key", "botId");
