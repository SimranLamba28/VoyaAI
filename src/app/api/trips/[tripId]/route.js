import { requireAuthedUser } from "@/lib/api/require-auth";
import { prisma } from "@/lib/prisma";

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
