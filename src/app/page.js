import { HomeHero } from "@/components/marketing/home-hero";
import { DestinationCarousel } from "@/components/marketing/destination-carousel";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const destinations = await prisma.destination.findMany({
    take: 8,
    orderBy: { name: "asc" },
  });

  return (
    <main>
      <HomeHero />
      <DestinationCarousel destinations={destinations} />
    </main>
  );
}
