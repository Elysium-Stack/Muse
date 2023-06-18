-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "modLogDeleteChannelId" TEXT,
ADD COLUMN     "modLogEditChannelId" TEXT,
ADD COLUMN     "modLogEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "modLogJoinChannelId" TEXT,
ADD COLUMN     "modLogLeaveChannelId" TEXT;
