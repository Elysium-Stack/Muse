/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `StarboardLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[originalMessageId]` on the table `StarboardLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StarboardLog_messageId_key" ON "StarboardLog"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "StarboardLog_originalMessageId_key" ON "StarboardLog"("originalMessageId");
