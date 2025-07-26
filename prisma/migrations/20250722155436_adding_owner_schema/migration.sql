/*
  Warnings:

  - Added the required column `ownerId` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "OwnerExpnse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OwnerExpnse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- CreateIndex
CREATE INDEX "Expense_ownerId_idx" ON "Expense"("ownerId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "OwnerExpnse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerExpnse" ADD CONSTRAINT "OwnerExpnse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
