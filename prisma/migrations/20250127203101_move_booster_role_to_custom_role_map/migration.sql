/*
  Warnings:

  - You are about to drop the `BoosterRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "BoosterRole";

-- CreateTable
CREATE TABLE "CustomRoleMap" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRoleMap_pkey" PRIMARY KEY ("id")
);
