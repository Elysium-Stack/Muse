-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "starboardIgnoredChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
