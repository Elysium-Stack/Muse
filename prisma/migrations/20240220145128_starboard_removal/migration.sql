/*
  Warnings:

  - You are about to drop the column `starboardChannelId` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `starboardEmoji` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `starboardEnabled` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `starboardIgnoredChannelIds` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `starboardSelf` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `starboardTreshold` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the `StarboardLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StarboardSpecificChannels` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "starboardChannelId",
DROP COLUMN "starboardEmoji",
DROP COLUMN "starboardEnabled",
DROP COLUMN "starboardIgnoredChannelIds",
DROP COLUMN "starboardSelf",
DROP COLUMN "starboardTreshold";

-- DropTable
DROP TABLE "StarboardLog";

-- DropTable
DROP TABLE "StarboardSpecificChannels";
