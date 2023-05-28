-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "radioEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "radioPlaylist" TEXT,
ADD COLUMN     "radioTextChannelId" TEXT,
ADD COLUMN     "radioVoiceChannelId" TEXT;
