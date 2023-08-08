-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "minecraftBedrockEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "minecraftConnectUrlBedrock" TEXT,
ADD COLUMN     "minecraftRconHost" TEXT,
ADD COLUMN     "minecraftRconPass" TEXT,
ADD COLUMN     "minecraftRconPort" TEXT;
