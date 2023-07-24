/*
  Warnings:

  - Added the required column `guildId` to the `MinecraftMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MinecraftMapping" ADD COLUMN     "guildId" TEXT NOT NULL;
