/*
  Warnings:

  - Made the column `bookwormDailyEnabled` on table `Settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bookwormPingEnabled` on table `Settings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "bookwormDailyHour" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "bookwormDailyEnabled" SET NOT NULL,
ALTER COLUMN "bookwormPingEnabled" SET NOT NULL;
