import { HomeHero } from "@/components/marketing/home-hero";
import { DestinationCarousel } from "@/components/marketing/destination-carousel";
import { prisma } from "@/lib/prisma";
import { CuratedTripCarousel } from "@/components/trips/curated-trip-carousel";

export default async function Home() {
  const destinations = await prisma.destination.findMany({
    take: 8,
    orderBy: { name: "asc" },
  });

  const curatedTrips = await prisma.curatedTrip.findMany({
    where: {
      featured: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });

  return (
    <main>
      <HomeHero />
      <DestinationCarousel destinations={destinations} />
      <CuratedTripCarousel trips={curatedTrips} />
    </main>
  );
}
