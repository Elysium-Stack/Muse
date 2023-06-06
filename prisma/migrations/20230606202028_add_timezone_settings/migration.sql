-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "timezoneEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "timezoneIgnoredChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
