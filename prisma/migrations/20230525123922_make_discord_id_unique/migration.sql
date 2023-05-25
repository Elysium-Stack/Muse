/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Users_discordId_key" ON "Users"("discordId");
