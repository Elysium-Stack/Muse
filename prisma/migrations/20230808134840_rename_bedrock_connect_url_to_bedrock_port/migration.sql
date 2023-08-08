/*
  Warnings:

  - You are about to drop the column `minecraftConnectUrlBedrock` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" RENAME COLUMN "minecraftConnectUrlBedrock" TO "minecraftBedrockPort";
