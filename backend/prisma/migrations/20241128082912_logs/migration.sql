-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('Debug', 'Log', 'Warning', 'Error');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "message" TEXT,
    "json" JSONB,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
