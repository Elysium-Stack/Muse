-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "customRoleAfterRoleId" TEXT,
ADD COLUMN     "customRoleEnabled" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "BoosterRole" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tos" TEXT NOT NULL,
    "requiredRoles" JSONB NOT NULL DEFAULT '[]',
    "blacklistedUsers" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoosterRole_pkey" PRIMARY KEY ("id")
);
