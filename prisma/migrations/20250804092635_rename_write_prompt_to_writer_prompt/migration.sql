/*
  Warnings:

  - You are about to drop the column `writePromptChannelId` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `writePromptEnabled` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `writePromptWriterRoleId` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "writePromptChannelId",
DROP COLUMN "writePromptEnabled",
DROP COLUMN "writePromptWriterRoleId",
ADD COLUMN     "writerPromptChannelId" TEXT,
ADD COLUMN     "writerPromptEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "writerPromptWriterRoleId" TEXT;
