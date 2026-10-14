import "server-only";

import {
  ITINERARY_JSON_EXAMPLE,
  validateItinerary,
} from "@/lib/ai/itinerary-schema";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const ITINERARY_MODEL = "nvidia/nemotron-3-super-120b-a12b:free"; 

const SYSTEM_PROMPT = `You are VoyaAI's travel planning assistant. Create a realistic, well-paced itinerary from the user's preferences.

Respond with a single valid JSON object only. No markdown fences, comments, or text outside the JSON.

Match this structure exactly (field names, nesting, and types). Use empty arrays where there are no meal suggestions. Use empty strings for optional activity location or timeOfDay when not applicable.

Example (2-day trip; your response must match the requested durationDays and day count):
${JSON.stringify(ITINERARY_JSON_EXAMPLE, null, 2)}

Rules:
- Top-level keys only: title, destination, durationDays, summary, estimatedTotalBudgetInr, budgetNotes, days, importantNotes.
- durationDays must equal days.length; each day has dayNumber 1..durationDays in order.
- Each day needs at least one activity; mealSuggestions may be [].
- mealType must be breakfast, lunch, dinner, or snack.
- estimatedTotalBudgetInr: whole rupees (INR), non-negative; align with the traveler's budget when given.
- Respect pace (relaxed / balanced / packed), interests, must-sees, and constraints.
- importantNotes: practical tips (may be [] if none).`;

function getOpenRouterErrorMessage(responseBody) {
  const body =
    responseBody && typeof responseBody === "object" && !Array.isArray(responseBody)
      ? responseBody
      : {};

  const error =
    body.error && typeof body.error === "object" && !Array.isArray(body.error)
      ? body.error
      : null;

  const baseMessage =
    (error && typeof error.message === "string" && error.message) ||
    (typeof body.message === "string" && body.message) ||
    "OpenRouter request failed.";

  const metadata =
    error?.metadata &&
    typeof error.metadata === "object" &&
    !Array.isArray(error.metadata)
      ? error.metadata
      : null;

  const providerName =
    metadata && typeof metadata.provider_name === "string"
      ? metadata.provider_name.trim()
      : "";

  let upstreamMessage = null;
  if (metadata && typeof metadata.raw === "string" && metadata.raw.trim()) {
    try {
      const parsed = JSON.parse(metadata.raw);
      const nested =
        parsed?.error && typeof parsed.error === "object"
          ? parsed.error
          : parsed;
      if (typeof nested?.message === "string" && nested.message.trim()) {
        upstreamMessage = nested.message.trim();
      }
    } catch {
      upstreamMessage = metadata.raw.trim();
    }
  }

  const detail =
    upstreamMessage &&
    upstreamMessage !== baseMessage &&
    baseMessage === "Provider returned error"
      ? upstreamMessage
      : upstreamMessage ?? baseMessage;

  return providerName ? `[${providerName}] ${detail}` : detail;
}

function getOpenRouterErrorCode(responseBody) {
  const error =
    responseBody &&
    typeof responseBody === "object" &&
    !Array.isArray(responseBody) &&
    responseBody.error &&
    typeof responseBody.error === "object" &&
    !Array.isArray(responseBody.error)
      ? responseBody.error
      : null;

  return error?.code ?? null;
}

function buildUserPrompt(preferences, curatedContext, resolvedDurationDays) {
  const payload = {
    destination: preferences.destination ?? "",
    durationDays: resolvedDurationDays,
    startDate: preferences.startDate ?? "",
    endDate: preferences.endDate ?? "",
    travelerType: preferences.travelerType ?? "",
    travelerCount: preferences.travelerCount ?? "",
    budgetInr: preferences.budgetInr ?? "",
    interests: preferences.interests ?? [],
    pace: preferences.pace ?? "",
    mustSee: preferences.mustSee ?? "",
    constraints: preferences.constraints ?? "",
  };

  if (curatedContext) {
    return `Personalize a trip for this traveler using the curated template below as inspiration only—not as a fixed schedule.

Rules:
- The itinerary MUST have exactly ${resolvedDurationDays} day(s): durationDays must be ${resolvedDurationDays} and days.length must be ${resolvedDurationDays}.
- templateDurationDays on the template may differ; select, combine, or skip template activities to fit the requested length.
- Keep the same destination and general route where it fits their preferences; adjust pacing, activities, and budget to match their answers.
- Do not invent a completely unrelated trip.

Curated trip template (JSON):
${JSON.stringify(curatedContext, null, 2)}

Traveler preferences (JSON):
${JSON.stringify(payload, null, 2)}`;
  }

  return `Plan a new trip using these preferences (JSON):\n${JSON.stringify(payload, null, 2)}`;
}

function failure(code, message, details) {
  return { ok: false, code, message, ...(details ? { details } : {}) };
}

/** Generate a structured itinerary via OpenRouter (server-only). */
export async function generateItinerary(preferences, curatedContext = null) {
  const resolvedPreferences = preferences ?? {};
  const resolvedDurationDays = Number(resolvedPreferences.durationDays);
  if (!Number.isInteger(resolvedDurationDays) || resolvedDurationDays < 1) {
    return failure(
      "INVALID_DURATION",
      "Trip length must be resolved before generating an itinerary.",
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return failure(
      "MISSING_API_KEY",
      "OPENROUTER_API_KEY is not set. Add it to .env.local on the server.",
    );
  }

  const body = {
    model: ITINERARY_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(
          resolvedPreferences,
          curatedContext,
          resolvedDurationDays,
        ),
      },
    ],
    response_format: { type: "json_object" },
  };

  let response;
  try {
    response = await fetch(OPENROUTER_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_HTTP_REFERER ??
          process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME ?? "VoyaAI",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("OpenRouter request failed:", error?.message ?? error);
    return failure(
      "NETWORK_ERROR",
      "Could not reach OpenRouter. Check your network and try again.",
    );
  }

  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    console.error(
      "OpenRouter returned a non-JSON body with status",
      response.status,
    );
    return failure(
      "INVALID_RESPONSE",
      "OpenRouter returned a response that could not be parsed as JSON.",
      { status: response.status },
    );
  }

  if (!response.ok) {
    const message = getOpenRouterErrorMessage(responseBody);
    console.error("OpenRouter HTTP error:", response.status, message);

    return failure("OPENROUTER_HTTP_ERROR", message, {
      status: response.status,
      openRouterErrorCode: getOpenRouterErrorCode(responseBody),
    });
  }

  const content = responseBody?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    console.error("OpenRouter completion missing message content", {
      status: response.status,
      model: responseBody?.model,
      reason: responseBody?.choices?.[0]?.finish_reason,
    });
    return failure(
      "INVALID_RESPONSE",
      "The model response did not include itinerary content.",
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("Failed to parse model content as JSON");
    return failure(
      "MALFORMED_JSON",
      "The model returned content that is not valid JSON.",
    );
  }

  const validation = validateItinerary(parsed, resolvedDurationDays);
  if (!validation.valid) {
    console.error("Itinerary validation failed:", validation.error);
    return failure("INVALID_ITINERARY", validation.error);
  }

  return { ok: true, itinerary: validation.itinerary };
}
