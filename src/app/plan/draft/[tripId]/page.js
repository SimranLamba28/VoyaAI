import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ImportantNotesSection } from "@/app/plan/components/important-notes-section";
import { ItineraryDay } from "@/app/trips/[slug]/components/itinerary-day";
import { TripHero } from "@/app/trips/[slug]/components/trip-hero";
import { TripOverview } from "@/app/trips/[slug]/components/trip-overview";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTripItineraryMetadata } from "@/lib/trips/parse-itinerary-metadata";
import { cn } from "@/lib/utils";

const DEFAULT_HERO_IMAGE = "/images/Destinations/Italy.jpg";
const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

function formatBudget(trip, metadata) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: trip.currency ?? "INR",
    maximumFractionDigits: 0,
  });

  if (metadata.estimatedTotalBudgetInr != null) {
    return formatter.format(metadata.estimatedTotalBudgetInr);
  }

  if (trip.budgetMin != null && trip.budgetMax != null) {
    if (trip.budgetMin === trip.budgetMax) {
      return formatter.format(trip.budgetMin);
    }
    return `${formatter.format(trip.budgetMin)} - ${formatter.format(
      trip.budgetMax,
    )}`;
  }

  return "Budget varies";
}

async function getOwnedTripDraft(tripId, userId) {
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

  const trip = await getOwnedTripDraft(tripId, userId);
  if (!trip) {
    return { title: "Trip not found" };
  }

  return {
    title: trip.itinerary?.title ?? trip.title,
    description: trip.itinerary?.description ?? undefined,
  };
}

export default async function DraftItineraryPage({ params }) {
  const { tripId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect(`/plan/new?draft=${encodeURIComponent(tripId)}`);
  }

  const trip = await getOwnedTripDraft(tripId, session.user.id);

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
  const budgetText = formatBudget(trip, metadata);
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
        backHref="/plan"
        backLabel="← Back to planner"
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
      <section
        className={cn(pageWrap, "mt-2 sm:mt-4")}
        aria-labelledby="draft-itinerary-heading"
      >
        <header className="max-w-3xl border-b border-border/35 pb-7 sm:pb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Itinerary
          </p>
          <h2
            id="draft-itinerary-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
          >
            {trip.itinerary.title ?? "Day by day"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
            Your AI-generated plan—refresh this page anytime to pick up where
            you left off.
          </p>
        </header>

        <ol className="mt-8 sm:mt-10">
          {itineraryDays.map((day, dayIndex) => (
            <ItineraryDay
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              media={media}
            />
          ))}
        </ol>

        <ImportantNotesSection
          notes={metadata.importantNotes}
          className="mt-12 sm:mt-14"
        />
      </section>
    </main>
  );
}
