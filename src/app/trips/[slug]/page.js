import { notFound } from "next/navigation";

import { TripAiCta } from "./components/trip-ai-cta";
import { TripHero } from "@/components/itinerary/trip-hero";
import { TripItinerary } from "@/components/itinerary/trip-itinerary";
import { TripOverview } from "@/components/itinerary/trip-overview";
import { formatCuratedTripBudgetText } from "@/lib/format-trip-budget";
import { getCuratedTripBySlug } from "@/lib/trips/curated-trip-queries";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const trip = await getCuratedTripBySlug(slug);

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
  const trip = await getCuratedTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const budgetText = formatCuratedTripBudgetText(trip);
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
