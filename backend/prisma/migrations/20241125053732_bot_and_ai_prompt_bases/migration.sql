-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'Bot'
);

-- CreateTable
CREATE TABLE "AIPrompt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "botId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_id_key" ON "Bot"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AIPrompt_id_key" ON "AIPrompt"("id");

-- AddForeignKey
ALTER TABLE "AIPrompt" ADD CONSTRAINT "AIPrompt_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
