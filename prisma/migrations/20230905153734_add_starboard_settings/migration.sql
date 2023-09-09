-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "starboardChannelId" TEXT,
ADD COLUMN     "starboardEmoji" TEXT NOT NULL DEFAULT '⭐',
ADD COLUMN     "starboardEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "starboardSelf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "starboardTreshold" INTEGER NOT NULL DEFAULT 3;
