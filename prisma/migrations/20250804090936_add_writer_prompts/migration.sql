-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "writePromptChannelId" TEXT,
ADD COLUMN     "writePromptEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "writePromptWriterRoleId" TEXT;

-- CreateTable
CREATE TABLE "WritePrompt" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritePrompt_pkey" PRIMARY KEY ("id")
);
