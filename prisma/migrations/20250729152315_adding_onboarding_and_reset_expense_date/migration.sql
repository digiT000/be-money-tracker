-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('HIS', 'HER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "completeOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completeOnboardingDate" TIMESTAMP(3),
ADD COLUMN     "dateResetExpense" INTEGER NOT NULL DEFAULT 25;
