-- CreateTable
CREATE TABLE "RadioLog" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "playing" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioLog_pkey" PRIMARY KEY ("id")
);
