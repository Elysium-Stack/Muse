/*
  Warnings:

  - You are about to drop the column `exact` on the `MessageTriggers` table. All the data in the column will be lost.
  - You are about to drop the column `exact` on the `ReactionTriggers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TriggerMatch" AS ENUM ('any', 'word', 'message');

-- AlterTable
ALTER TABLE "MessageTriggers" ADD COLUMN     "match" "TriggerMatch" NOT NULL DEFAULT 'any';
UPDATE "MessageTriggers" SET match='message' WHERE exact=true;
ALTER TABLE "MessageTriggers" DROP COLUMN "exact";

-- AlterTable
ALTER TABLE "ReactionTriggers" ADD COLUMN     "match" "TriggerMatch" NOT NULL DEFAULT 'any';
UPDATE "ReactionTriggers" SET match='message' WHERE exact=true;
ALTER TABLE "ReactionTriggers" DROP COLUMN "exact";
