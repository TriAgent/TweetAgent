-- CreateTable
CREATE TABLE "TwitterAccount" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userScreeName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterAccount_id_key" ON "TwitterAccount"("id");
