-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "purgeIgnoredParentChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
