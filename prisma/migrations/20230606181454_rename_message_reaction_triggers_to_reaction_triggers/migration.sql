/*
  Warnings:

  - You are about to drop the `MessageReactionTriggers` table. If the table is not empty, all the data it contains will be lost.

*/
-- RenameTable
ALTER TABLE "MessageReactionTriggers"
  RENAME TO "ReactionTriggers";