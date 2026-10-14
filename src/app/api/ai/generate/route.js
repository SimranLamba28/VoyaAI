import { prepareTripPreferencesForGeneration } from "@/lib/trips/trip-preferences";
import { generateItinerary } from "@/lib/ai/generate-itinerary";
import { requireAuthedUser } from "@/lib/api/require-auth";
import {
  loadCuratedTemplateForAi,
  parseGenerateItineraryRequest,
  saveGeneratedItinerary,
  saveUserTripBeforeGeneration,
} from "@/lib/trips/user-trip-generation";

function statusForGenerationFailure(code) {
  switch (code) {
    case "MISSING_API_KEY":
    case "NETWORK_ERROR":
      return 503;
    case "OPENROUTER_HTTP_ERROR":
    case "INVALID_RESPONSE":
    case "MALFORMED_JSON":
    case "INVALID_ITINERARY":
      return 502;
    case "INVALID_PREFERENCES":
    case "INVALID_DURATION":
      return 400;
    default:
      return 500;
  }
}

export async function POST(request) {
  const authResult = await requireAuthedUser(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;

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

  const { tripId: requestedTripId, preferences: rawPreferences, curatedTripSlug } =
    parseGenerateItineraryRequest(body);

  let curatedContext = null;
  let curatedTripId = null;
  let catalogDefaultDuration = null;
  if (curatedTripSlug) {
    const curated = await loadCuratedTemplateForAi(curatedTripSlug);
    if (!curated) {
      return Response.json(
        {
          ok: false,
          code: "CURATED_TRIP_NOT_FOUND",
          message: "Curated trip was not found.",
        },
        { status: 404 },
      );
    }
    curatedContext = curated.context;
    curatedTripId = curated.curatedTripId;
    catalogDefaultDuration = curated.context.templateDurationDays ?? null;
  }

  const prepared = prepareTripPreferencesForGeneration(rawPreferences, {
    defaultDurationDays: catalogDefaultDuration,
  });
  if (!prepared.ok) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_PREFERENCES",
        message: prepared.message,
      },
      { status: 400 },
    );
  }
  const preferences = prepared.preferences;

  let draft;
  try {
    draft = await saveUserTripBeforeGeneration(
      requestedTripId,
      user.id,
      preferences,
      curatedTripId,
    );
  } catch (error) {
    console.error("Failed to prepare trip draft for generation:", error);
    return Response.json(
      {
        ok: false,
        code: "PERSISTENCE_ERROR",
        message: "Could not save your trip before generation.",
      },
      { status: 500 },
    );
  }

  if (requestedTripId && !draft) {
    return Response.json(
      {
        ok: false,
        code: "TRIP_NOT_FOUND",
        message: "Trip not found.",
      },
      { status: 404 },
    );
  }

  const activeTripId = draft.trip.id;

  const result = await generateItinerary(preferences, curatedContext);

  if (!result.ok) {
    console.error("Itinerary generation failed:", result.code, result.message);
    const { ok: _ok, ...errorBody } = result;
    return Response.json(
      { ok: false, ...errorBody, tripId: activeTripId },
      { status: statusForGenerationFailure(result.code) },
    );
  }

  try {
    const committed = await saveGeneratedItinerary(
      activeTripId,
      user.id,
      result.itinerary,
    );
    if (!committed) {
      return Response.json(
        {
          ok: false,
          code: "TRIP_NOT_FOUND",
          message: "Trip not found.",
          tripId: activeTripId,
        },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Failed to persist generated itinerary:", error);
    return Response.json(
      {
        ok: false,
        code: "PERSISTENCE_ERROR",
        message:
          "Your itinerary was generated but could not be saved. Please try again.",
        tripId: activeTripId,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, tripId: activeTripId });
}
