import { CuratedTripFilters } from "@/components/trips/curated-trip-filters";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Curated Trips",
  description:
    "Browse thoughtfully planned journeys to inspiring destinations with VoyaAI.",
};

export default async function TripsPage({ searchParams }) {
  const { destination: destinationSlug } = await searchParams;

  const [trips, destinations] = await Promise.all([
    prisma.curatedTrip.findMany({
      orderBy: { displayOrder: "asc" },
      include: { destination: true },
    }),
    prisma.destination.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const initialDestination =
    destinationSlug &&
    destinations.some((destination) => destination.slug === destinationSlug)
      ? destinationSlug
      : "";

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-12 lg:mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Plan
          </p>

          <h1 className="relative mt-2 inline-block text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Curated Trips
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-12 rounded-full bg-primary/35 sm:w-16"
              aria-hidden="true"
            />
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Discover thoughtfully planned journeys to inspiring destinations.
            Each trip includes duration, budget estimates, and highlights to
            help you start planning.
          </p>
        </header>

        <CuratedTripFilters
          trips={trips}
          destinations={destinations}
          initialDestination={initialDestination}
        />
      </div>
    </main>
  );
}
