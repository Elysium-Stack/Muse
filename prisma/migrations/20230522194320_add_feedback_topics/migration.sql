-- CreateEnum
CREATE TYPE "FeedbackTopicsType" AS ENUM ('CHANNEL', 'GOOGLE_SHEET');

-- CreateTable
CREATE TABLE "FeedbackTopics" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" "FeedbackTopicsType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FeedbackTopics_pkey" PRIMARY KEY ("id")
);
