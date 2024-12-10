-- CreateTable
CREATE TABLE "DebugComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "botId" TEXT,
    "featureId" TEXT,
    "xPostId" TEXT,

    CONSTRAINT "DebugComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DebugComment" ADD CONSTRAINT "DebugComment_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugComment" ADD CONSTRAINT "DebugComment_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "BotFeature"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugComment" ADD CONSTRAINT "DebugComment_xPostId_fkey" FOREIGN KEY ("xPostId") REFERENCES "XPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
