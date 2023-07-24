-- CreateTable
CREATE TABLE "MinecraftMapping" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "MinecraftMapping_pkey" PRIMARY KEY ("id")
);
