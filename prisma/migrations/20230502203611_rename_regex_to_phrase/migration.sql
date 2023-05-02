/*
  Warnings:

  - You are about to drop the column `regex` on the `MessageReactionTriggers` table. All the data in the column will be lost.
  - Added the required column `phrase` to the `MessageReactionTriggers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageReactionTriggers" RENAME COLUMN "regex" TO "phrase";
