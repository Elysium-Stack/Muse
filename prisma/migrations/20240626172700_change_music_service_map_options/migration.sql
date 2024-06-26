/*
  Warnings:

  - You are about to drop the column `serviceName` on the `MusicServiceMap` table. All the data in the column will be lost.
  - Added the required column `finished` to the `MusicServiceMap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instance` to the `MusicServiceMap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `MusicServiceMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MusicServiceMap" DROP COLUMN "serviceName",
ADD COLUMN     "finished" BOOLEAN NOT NULL,
ADD COLUMN     "instance" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
