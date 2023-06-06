-- AlterTable
ALTER TABLE "ReactionTriggers" RENAME CONSTRAINT "MessageReactionTriggers_pkey" TO "ReactionTriggers_pkey";

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "messageTriggerEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "messageTriggerIgnoredChannelIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "MessageTriggers" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "exact" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MessageTriggers_pkey" PRIMARY KEY ("id")
);
