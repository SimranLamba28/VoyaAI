-- CreateTable
CREATE TABLE "TripMedia" (
    "id" TEXT NOT NULL,
    "curatedTripId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TripMedia_curatedTripId_idx" ON "TripMedia"("curatedTripId");

-- CreateIndex
CREATE INDEX "TripMedia_curatedTripId_placement_idx" ON "TripMedia"("curatedTripId", "placement");

-- AddForeignKey
ALTER TABLE "TripMedia" ADD CONSTRAINT "TripMedia_curatedTripId_fkey" FOREIGN KEY ("curatedTripId") REFERENCES "CuratedTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
