-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "requestRoleEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "requestRoleLogChannelId" TEXT;
