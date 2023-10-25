-- CreateTable
CREATE TABLE "StarboardSpecificChannels" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "sourceChannelId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarboardSpecificChannels_pkey" PRIMARY KEY ("id")
);
