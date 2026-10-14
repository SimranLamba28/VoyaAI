import { prisma } from "@/lib/prisma";

export async function getDraftResumeState(draftTripId, userId) {
  const trip = await prisma.trip.findFirst({
    where: { id: draftTripId, userId },
    include: {
      itinerary: { select: { id: true } },
      curatedTrip: { select: { slug: true } },
    },
  });

  if (!trip) {
    return { kind: "missing" };
  }

  if (trip.itinerary) {
    return { kind: "ready", tripId: trip.id };
  }

  const preferences =
    trip.preferences &&
    typeof trip.preferences === "object" &&
    !Array.isArray(trip.preferences)
      ? trip.preferences
      : null;

  return {
    kind: "resume",
    tripId: trip.id,
    preferences,
    curatedTripSlug: trip.curatedTrip?.slug ?? null,
  };
}
