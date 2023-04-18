-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "musicChannelId" TEXT,
ADD COLUMN     "musicDjRoleId" TEXT,
ADD COLUMN     "musicEnabled" BOOLEAN DEFAULT true;
