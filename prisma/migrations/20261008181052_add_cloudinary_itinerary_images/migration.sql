/*
  Warnings:

  - You are about to drop the column `image` on the `ItineraryDay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ItineraryDay" DROP COLUMN "image",
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;
