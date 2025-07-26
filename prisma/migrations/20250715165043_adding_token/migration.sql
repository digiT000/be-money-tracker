-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenEmailVerified" TEXT,
ADD COLUMN     "tokenEmailVerifiedCreatedAt" TIMESTAMP(3),
ADD COLUMN     "tokenEmailVerifiedExpiresAt" TIMESTAMP(3),
ADD COLUMN     "tokenPasswordReset" TEXT,
ADD COLUMN     "tokenPasswordResetCreatedAt" TIMESTAMP(3),
ADD COLUMN     "tokenPasswordResetExpiresAt" TIMESTAMP(3);
