/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `OwnerExpnse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OwnerExpnse_userId_key" ON "OwnerExpnse"("userId");
