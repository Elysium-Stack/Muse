-- CreateTable
CREATE TABLE "RequestRoleEntries" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tos" TEXT NOT NULL,
    "requiredRoles" JSONB NOT NULL DEFAULT '[]',
    "blacklistedUsers" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestRoleEntries_pkey" PRIMARY KEY ("id")
);
