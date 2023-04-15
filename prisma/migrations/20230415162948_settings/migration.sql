-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "bookwormEnabled" BOOLEAN DEFAULT true,
    "bookwormChannelId" TEXT,
    "bookwormDailyEnabled" BOOLEAN DEFAULT true,
    "bookwormDailyChannelId" TEXT,
    "bookwormPingEnabled" BOOLEAN DEFAULT false,
    "bookwormPingRoleId" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_guildId_key" ON "Settings"("guildId");
