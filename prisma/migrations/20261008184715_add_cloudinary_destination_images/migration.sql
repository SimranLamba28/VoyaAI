/*
  Warnings:

  - You are about to drop the column `heroImage` on the `Destination` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "heroImage",
ADD COLUMN     "heroImagePublicId" TEXT,
ADD COLUMN     "heroImageUrl" TEXT;
