import { resolveTripDurationDays } from "@/lib/trips/trip-preferences";
import { prisma } from "@/lib/prisma";
import { serializeDayActivitiesPayload } from "@/lib/trips/itinerary-day-data";

/**
 * Trip draft persistence for AI generation (used by POST /api/ai/generate):
 * parse request → upsert Trip row → generate AI → commit TripItinerary + days on Trip.
 */

export function parseGenerateItineraryRequest(body) {
  const { tripId, curatedTripSlug, ...rest } = body;
  return {
    tripId: typeof tripId === "string" && tripId.trim() ? tripId.trim() : undefined,
    curatedTripSlug:
      typeof curatedTripSlug === "string" && curatedTripSlug.trim()
        ? curatedTripSlug.trim()
        : undefined,
    preferences: rest,
  };
}

export function userTripFieldsFromPreferences(preferences) {
  const destinationRaw = preferences.destination;
  const destination =
    typeof destinationRaw === "string" ? destinationRaw.trim() : "";

  const resolvedDuration = resolveTripDurationDays(preferences);
  const duration = resolvedDuration != null && resolvedDuration > 0 ? resolvedDuration : 1;

  const travelerCount = Number(preferences.travelerCount);
  const travelers =
    Number.isInteger(travelerCount) && travelerCount > 0 ? travelerCount : 1;

  let budgetMin = null;
  let budgetMax = null;
  const budgetRaw = preferences.budgetInr;
  if (budgetRaw !== "" && budgetRaw != null) {
    const budget = Number(budgetRaw);
    if (!Number.isNaN(budget) && budget > 0) {
      budgetMin = budget;
      budgetMax = budget;
    }
  }

  const title = destination ? `Trip to ${destination}` : "Trip draft";

  return {
    title,
    destination: destination || "Unknown",
    duration,
    travelers,
    budgetMin,
    budgetMax,
  };
}

/** One curated-trip query for both DB id and AI context. */
export async function loadCuratedTemplateForAi(curatedTripSlug) {
  const trip = await prisma.curatedTrip.findUnique({
    where: { slug: curatedTripSlug },
    include: {
      destination: { select: { name: true, country: true } },
      itinerary: {
        include: {
          days: { orderBy: { dayNumber: "asc" } },
        },
      },
    },
  });

  if (!trip) {
    return null;
  }

  return {
    curatedTripId: trip.id,
    context: {
      slug: trip.slug,
      title: trip.title,
      location: trip.location,
      templateDurationDays: trip.duration,
      description: trip.description,
      budgetMin: trip.budgetMin,
      budgetMax: trip.budgetMax,
      currency: trip.currency,
      destination: trip.destination
        ? {
            name: trip.destination.name,
            country: trip.destination.country,
          }
        : null,
      itineraryTitle: trip.itinerary?.title ?? null,
      itinerarySummary: trip.itinerary?.description ?? null,
      days: (trip.itinerary?.days ?? []).map((day) => ({
        dayNumber: day.dayNumber,
        title: day.title,
        description: day.description,
        activities: day.activities,
      })),
    },
  };
}

/** Prepare the user's Trip draft before the AI runs. Returns null when tripId was sent but not owned by userId. */
export async function saveUserTripBeforeGeneration(
  tripId,
  userId,
  preferences,
  curatedTripId = null,
) {
  const scalars = userTripFieldsFromPreferences(preferences);
  const tripData = {
    preferences,
    ...scalars,
    ...(curatedTripId != null && { curatedTripId }),
  };

  if (tripId) {
    const existing = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: tripData,
    });

    return { trip };
  }

  const trip = await prisma.trip.create({
    data: {
      userId,
      status: "draft",
      curatedTripId: curatedTripId ?? null,
      ...tripData,
    },
  });

  return { trip };
}

/**
 * Maps a validated AI itinerary to Prisma rows and saves in one transaction.
 * Only call with output from validateItinerary / generateItinerary.
 */
export async function saveGeneratedItinerary(tripId, userId, itinerary) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });
  if (!trip) {
    return false;
  }

  const { title, destination, durationDays, summary, days } = itinerary;
  const estimatedTotalBudgetInr = itinerary.estimatedTotalBudgetInr;

  const dayRows = days.map((day) => ({
    dayNumber: day.dayNumber,
    title: day.title,
    description: day.summary,
    activities: serializeDayActivitiesPayload(day),
  }));

  const metadata = {
    estimatedTotalBudgetInr,
    budgetNotes: itinerary.budgetNotes,
    importantNotes: itinerary.importantNotes,
  };

  await prisma.$transaction(async (tx) => {
    await tx.tripItinerary.deleteMany({ where: { tripId } });

    await tx.tripItinerary.create({
      data: {
        tripId,
        title,
        description: summary,
        metadata,
        days: { create: dayRows },
      },
    });

    await tx.trip.update({
      where: { id: tripId },
      data: {
        status: "draft",
        title,
        destination,
        duration: durationDays,
        budgetMin: estimatedTotalBudgetInr,
        budgetMax: estimatedTotalBudgetInr,
      },
    });
  });

  return true;
}
