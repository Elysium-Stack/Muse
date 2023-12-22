-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "qotdChannelId" TEXT,
ADD COLUMN     "qotdDailyChannelId" TEXT,
ADD COLUMN     "qotdDailyEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qotdDailyHour" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "qotdEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "qotdPingRoleId" TEXT;

-- CreateTable
CREATE TABLE "QotDLog" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "index" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QotDLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicServiceMap" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "voiceChannelId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicServiceMap_pkey" PRIMARY KEY ("id")
);
