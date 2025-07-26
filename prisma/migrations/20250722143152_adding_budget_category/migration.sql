/*
  Warnings:

  - Added the required column `budgetCategory` to the `CategoryExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoryExpense" ADD COLUMN     "budgetCategory" DOUBLE PRECISION NOT NULL;
