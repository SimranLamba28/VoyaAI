import { validateItinerary } from "@/lib/ai/itinerary-schema";
import { requireAuthedUser } from "@/lib/api/require-auth";
import { prisma } from "@/lib/prisma";
import { resolveTripDurationDays } from "@/lib/trips/trip-preferences";
import {
  loadUserTripForItineraryRegeneration,
  saveGeneratedItinerary,
} from "@/lib/trips/user-trip-generation";

export async function DELETE(request, { params }) {
  const authResult = await requireAuthedUser(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { tripId } = await params;

  if (!tripId || typeof tripId !== "string" || !tripId.trim()) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_TRIP_ID",
        message: "A valid trip id is required.",
      },
      { status: 400 },
    );
  }

  const ownedTrip = await prisma.trip.findFirst({
    where: {
      id: tripId.trim(),
      userId: user.id,
    },
    select: { id: true },
  });

  if (!ownedTrip) {
    return Response.json(
      {
        ok: false,
        code: "TRIP_NOT_FOUND",
        message: "Trip not found or you do not have permission to delete it.",
      },
      { status: 404 },
    );
  }

  try {
    // TripItinerary and TripItineraryDay rows cascade from Trip (see Prisma schema).
    await prisma.trip.delete({
      where: { id: ownedTrip.id },
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        ok: false,
        code: "DELETE_FAILED",
        message: "Could not delete this trip. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const authResult = await requireAuthedUser(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { tripId } = await params;

  if (!tripId || typeof tripId !== "string" || !tripId.trim()) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_TRIP_ID",
        message: "A valid trip id is required.",
      },
      { status: 400 },
    );
  }

  const trimmedTripId = tripId.trim();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_BODY",
        message: "Request body must be a JSON object.",
      },
      { status: 400 },
    );
  }

  const { itinerary } = body;
  if (!itinerary || typeof itinerary !== "object" || Array.isArray(itinerary)) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_ITINERARY",
        message: "Request body must include an itinerary object.",
      },
      { status: 400 },
    );
  }

  const loaded = await loadUserTripForItineraryRegeneration(
    trimmedTripId,
    user.id,
  );

  if (!loaded) {
    return Response.json(
      {
        ok: false,
        code: "TRIP_NOT_FOUND",
        message: "Trip not found or you do not have permission to update it.",
      },
      { status: 404 },
    );
  }

  const catalogDefaultDuration =
    loaded.curatedContext?.templateDurationDays ?? null;

  let expectedDurationDays = loaded.preferences
    ? resolveTripDurationDays(loaded.preferences, catalogDefaultDuration)
    : null;

  if (expectedDurationDays == null && loaded.currentItinerary?.durationDays) {
    expectedDurationDays = loaded.currentItinerary.durationDays;
  }

  if (expectedDurationDays == null) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_TRIP_DURATION",
        message: "Could not determine the expected trip length for this trip.",
        tripId: loaded.trip.id,
      },
      { status: 400 },
    );
  }

  const validation = validateItinerary(itinerary, expectedDurationDays);
  if (!validation.valid) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_ITINERARY",
        message: validation.error,
        tripId: loaded.trip.id,
      },
      { status: 400 },
    );
  }

  try {
    const saved = await saveGeneratedItinerary(
      trimmedTripId,
      user.id,
      validation.itinerary,
      { preserveTripStatus: true },
    );

    if (!saved) {
      return Response.json(
        {
          ok: false,
          code: "TRIP_NOT_FOUND",
          message: "Trip not found or you do not have permission to update it.",
          tripId: loaded.trip.id,
        },
        { status: 404 },
      );
    }
  } catch {
    return Response.json(
      {
        ok: false,
        code: "SAVE_FAILED",
        message: "Could not save this itinerary. Please try again.",
        tripId: loaded.trip.id,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, tripId: loaded.trip.id });
}
