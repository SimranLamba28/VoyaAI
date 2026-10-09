import { notFound } from "next/navigation";

import { TripAiCta } from "./components/trip-ai-cta";
import { TripHero } from "./components/trip-hero";
import { TripItinerary } from "./components/trip-itinerary";
import { TripOverview } from "./components/trip-overview";
import { prisma } from "@/lib/prisma";

function formatBudget(trip) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: trip.currency ?? "INR",
    maximumFractionDigits: 0,
  });

  if (trip.budgetMin != null && trip.budgetMax != null) {
    return `${formatter.format(trip.budgetMin)} - ${formatter.format(
      trip.budgetMax
    )}`;
  }

  return "Budget varies";
}

async function getTripBySlug(slug) {
  return prisma.curatedTrip.findUnique({
    where: { slug },
    include: {
      destination: true,
      media: true,
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
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    return { title: "Trip not found" };
  }

  return {
    title: trip.title,
    description: trip.description ?? undefined,
  };
}

export default async function CuratedTripDetailPage({ params }) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const budgetText = formatBudget(trip);
  const itineraryDays = trip.itinerary?.days ?? [];
  const destination = trip.destination;

  const overviewLead =
    trip.itinerary?.description ?? trip.description ?? null;
  const overviewSecondary =
    trip.itinerary?.description && trip.description
      ? trip.description
      : destination?.description ?? null;

  return (
    <main className="pb-14 sm:pb-16 lg:pb-20">
      <TripHero trip={trip} destination={destination} budgetText={budgetText} />
      <TripOverview
        trip={trip}
        destination={destination}
        budgetText={budgetText}
        overviewLead={overviewLead}
        overviewSecondary={overviewSecondary}
      />
      <TripItinerary trip={trip} itineraryDays={itineraryDays} />
      <TripAiCta trip={trip} budgetText={budgetText} />
    </main>
  );
}
