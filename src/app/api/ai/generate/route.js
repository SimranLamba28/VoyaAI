import { prepareTripPreferencesForGeneration } from "@/lib/trips/trip-preferences";
import { generateItinerary } from "@/lib/ai/generate-itinerary";
import { requireAuthedUser } from "@/lib/api/require-auth";
import {
  loadCuratedTemplateForAi,
  loadUserTripForItineraryRegeneration,
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

  const {
    tripId: requestedTripId,
    preferences: rawPreferences,
    curatedTripSlug,
    revisionInstructions,
    preview,
  } = parseGenerateItineraryRequest(body);

  if (preview && !revisionInstructions) {
    return Response.json(
      {
        ok: false,
        code: "INVALID_PREVIEW",
        message: "Preview mode requires revision instructions.",
      },
      { status: 400 },
    );
  }

  if (revisionInstructions) {
    if (!preview) {
      return Response.json(
        {
          ok: false,
          code: "PREVIEW_REQUIRED",
          message:
            "Itinerary revision requests must set preview to true.",
        },
        { status: 400 },
      );
    }

    if (!requestedTripId) {
      return Response.json(
        {
          ok: false,
          code: "MISSING_TRIP_ID",
          message: "A trip id is required to revise an itinerary.",
        },
        { status: 400 },
      );
    }

    const loaded = await loadUserTripForItineraryRegeneration(
      requestedTripId,
      user.id,
    );

    if (!loaded) {
      return Response.json(
        {
          ok: false,
          code: "TRIP_NOT_FOUND",
          message: "Trip not found.",
        },
        { status: 404 },
      );
    }

    if (!loaded.currentItinerary) {
      return Response.json(
        {
          ok: false,
          code: "MISSING_ITINERARY",
          message: "This trip does not have an itinerary to revise.",
          tripId: loaded.trip.id,
        },
        { status: 400 },
      );
    }

    if (!loaded.preferences) {
      return Response.json(
        {
          ok: false,
          code: "MISSING_PREFERENCES",
          message: "Stored trip preferences are missing or invalid.",
          tripId: loaded.trip.id,
        },
        { status: 400 },
      );
    }

    const catalogDefaultDuration =
      loaded.curatedContext?.templateDurationDays ??
      loaded.currentItinerary.durationDays ??
      null;

    const preparedRevision = prepareTripPreferencesForGeneration(
      loaded.preferences,
      { defaultDurationDays: catalogDefaultDuration },
    );
    if (!preparedRevision.ok) {
      return Response.json(
        {
          ok: false,
          code: "INVALID_PREFERENCES",
          message: preparedRevision.message,
          tripId: loaded.trip.id,
        },
        { status: 400 },
      );
    }

    const revisionResult = await generateItinerary(
      preparedRevision.preferences,
      loaded.curatedContext,
      {
        revisionInstructions,
        currentItinerary: loaded.currentItinerary,
      },
    );

    if (!revisionResult.ok) {
      console.error(
        "Itinerary revision failed:",
        revisionResult.code,
        revisionResult.message,
      );
      const { ok: _ok, ...errorBody } = revisionResult;
      return Response.json(
        { ok: false, ...errorBody, tripId: loaded.trip.id },
        { status: statusForGenerationFailure(revisionResult.code) },
      );
    }

    return Response.json({
      ok: true,
      tripId: loaded.trip.id,
      itinerary: revisionResult.itinerary,
    });
  }

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
