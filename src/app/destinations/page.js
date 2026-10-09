import { DestinationGrid } from "@/components/destinations/destination-grid";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Destinations",
  description:
    "Explore countries and find your next adventure with VoyaAI.",
};

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-12 lg:mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Explore
          </p>

          <h1 className="relative mt-2 inline-block text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Destinations
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-12 rounded-full bg-primary/35 sm:w-16"
              aria-hidden="true"
            />
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Browse countries handpicked for unforgettable journeys. Choose a
            destination to discover curated trips and start planning.
          </p>
        </header>

        <DestinationGrid destinations={destinations} />
      </div>
    </main>
  );
}
