-- CreateTable
CREATE TABLE "BookwormLog" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "index" INTEGER,

    CONSTRAINT "BookwormLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookwormLog_guildId_key" ON "BookwormLog"("guildId");
