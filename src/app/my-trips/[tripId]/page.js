import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { TripItinerarySection } from "@/app/my-trips/[tripId]/trip-itinerary-section";
import { TripHero } from "@/components/itinerary/trip-hero";
import { TripOverview } from "@/components/itinerary/trip-overview";
import { auth } from "@/lib/auth";
import { formatUserTripBudgetText } from "@/lib/format-trip-budget";
import { prisma } from "@/lib/prisma";
import { parseTripItineraryMetadata } from "@/lib/trips/parse-itinerary-metadata";
import { cn } from "@/lib/utils";

const DEFAULT_HERO_IMAGE = "/images/destinations/italy.jpg";
const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

async function getOwnedUserTrip(tripId, userId) {
  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      curatedTrip: {
        include: {
          destination: true,
          media: true,
        },
      },
      itinerary: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const { tripId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return { title: "Your itinerary" };
  }

  const trip = await getOwnedUserTrip(tripId, userId);
  if (!trip) {
    return { title: "Trip not found" };
  }

  return {
    title: trip.itinerary?.title ?? trip.title,
    description: trip.itinerary?.description ?? undefined,
  };
}

export default async function UserTripPage({ params }) {
  const { tripId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect(`/plan/new?draft=${encodeURIComponent(tripId)}`);
  }

  const trip = await getOwnedUserTrip(tripId, session.user.id);

  if (!trip) {
    notFound();
  }

  const itineraryDays = trip.itinerary?.days ?? [];
  if (!trip.itinerary || itineraryDays.length === 0) {
    return (
      <main className="pb-14 sm:pb-16 lg:pb-20">
        <div className={cn(pageWrap, "py-16 sm:py-20")}>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            No itinerary yet
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-[15px]">
            This trip does not have a saved day-by-day plan. Return to the
            planner and generate an itinerary for your preferences.
          </p>
        </div>
      </main>
    );
  }

  const metadata = parseTripItineraryMetadata(trip.itinerary.metadata);
  const budgetText = formatUserTripBudgetText(trip, metadata);
  const curated = trip.curatedTrip;
  const curatedDestination = curated?.destination ?? null;

  const destination = curatedDestination
    ? curatedDestination
    : { name: trip.destination };

  const heroTrip = {
    title: trip.itinerary.title ?? trip.title,
    image: curated?.image ?? DEFAULT_HERO_IMAGE,
    altText: curated?.altText ?? trip.title,
    location: curated?.location ?? trip.destination,
    duration: trip.duration,
    description: trip.itinerary.description ?? null,
    itinerary: trip.itinerary,
  };

  const overviewLead = trip.itinerary.description ?? null;
  const overviewSecondary = metadata.budgetNotes ?? null;

  const media = curated?.media ?? [];

  return (
    <main className="pb-14 sm:pb-16 lg:pb-20">
      <TripHero
        trip={heroTrip}
        destination={destination}
        budgetText={budgetText}
        backHref="/my-trips"
        backLabel="← Back to My Trips"
        destinationEyebrow={
          curatedDestination?.name
            ? curatedDestination.name
            : "Your personalized trip"
        }
      />
      <TripOverview
        trip={heroTrip}
        destination={destination}
        budgetText={budgetText}
        overviewLead={overviewLead}
        overviewSecondary={overviewSecondary}
      />
      <TripItinerarySection
        tripId={trip.id}
        itineraryTitle={trip.itinerary.title ?? "Day by day"}
        savedDays={itineraryDays}
        importantNotes={metadata.importantNotes}
        media={media}
      />
    </main>
  );
}
