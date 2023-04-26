-- CreateTable
CREATE TABLE "MessageReactionTriggers" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "regex" TEXT NOT NULL,
    "emojiId" TEXT NOT NULL,

    CONSTRAINT "MessageReactionTriggers_pkey" PRIMARY KEY ("id")
);
