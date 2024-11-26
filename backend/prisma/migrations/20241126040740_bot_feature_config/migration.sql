-- CreateTable
CREATE TABLE "BotFeatureConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}'
);

-- CreateIndex
CREATE UNIQUE INDEX "BotFeatureConfig_id_key" ON "BotFeatureConfig"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BotFeatureConfig_botId_key_key" ON "BotFeatureConfig"("botId", "key");

-- AddForeignKey
ALTER TABLE "BotFeatureConfig" ADD CONSTRAINT "BotFeatureConfig_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
