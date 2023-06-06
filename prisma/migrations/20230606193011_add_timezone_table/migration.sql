-- CreateTable
CREATE TABLE "TimezoneData" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "TimezoneData_pkey" PRIMARY KEY ("id")
);
