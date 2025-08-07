/*
  Warnings:

  - Added the required column `isPrimaryUser` to the `OwnerExpnse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OwnerExpnse" ADD COLUMN     "isPrimaryUser" BOOLEAN NOT NULL;
