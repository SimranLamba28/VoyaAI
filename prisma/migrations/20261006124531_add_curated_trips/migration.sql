-- CreateTable
CREATE TABLE "CuratedTrip" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "altText" TEXT,
    "duration" INTEGER NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedTrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuratedTrip_slug_key" ON "CuratedTrip"("slug");

-- CreateIndex
CREATE INDEX "CuratedTrip_destinationId_idx" ON "CuratedTrip"("destinationId");

-- AddForeignKey
ALTER TABLE "CuratedTrip" ADD CONSTRAINT "CuratedTrip_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
