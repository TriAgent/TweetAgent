-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "botId" TEXT;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
