-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "reactionTriggerEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "reactionTriggerIgnoredChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
