import "server-only";

import {
  ITINERARY_JSON_EXAMPLE,
  validateItinerary,
} from "@/lib/ai/itinerary-schema";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const ITINERARY_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const OPENROUTER_TIMEOUT_MS = 120_000;
const MAX_GENERATION_ATTEMPTS = 2;

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

export function extractJsonFromModelContent(content) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  const wholeFence = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/i);
  if (wholeFence) {
    return wholeFence[1].trim();
  }

  const embeddedFence = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (embeddedFence) {
    return embeddedFence[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseAndValidateModelItinerary(content, expectedDurationDays) {
  if (typeof content !== "string" || !content.trim()) {
    return {
      ok: false,
      code: "INVALID_RESPONSE",
      message: "The model response did not include itinerary content.",
    };
  }

  const jsonText = extractJsonFromModelContent(content);
  if (!jsonText) {
    return {
      ok: false,
      code: "INVALID_RESPONSE",
      message: "The model response did not include itinerary content.",
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      ok: false,
      code: "MALFORMED_JSON",
      message: "The model returned content that is not valid JSON.",
    };
  }

  const validation = validateItinerary(parsed, expectedDurationDays);
  if (!validation.valid) {
    return {
      ok: false,
      code: "INVALID_ITINERARY",
      message: validation.error,
    };
  }

  return { ok: true, itinerary: validation.itinerary };
}

function buildValidationRetryUserMessage(
  validationError,
  expectedDurationDays,
) {
  return `Your previous JSON failed validation: ${validationError}

Return one corrected itinerary as a single JSON object only (no markdown). It must satisfy every rule in the system prompt, including:
- A non-empty title
- durationDays exactly ${expectedDurationDays}
- days.length exactly ${expectedDurationDays}
- dayNumber values 1 through ${expectedDurationDays} in order
- At least one activity on every day`;
}

function buildMalformedJsonRetryUserMessage() {
  return `Your previous response was not valid JSON. Return only a single JSON object matching the itinerary schema from the system prompt. No markdown fences or extra text.`;
}

function getOpenRouterErrorMessage(responseBody) {
  const body =
    responseBody &&
    typeof responseBody === "object" &&
    !Array.isArray(responseBody)
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
      : (upstreamMessage ?? baseMessage);

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

function normalizeRevisionContext(revision) {
  if (!revision || typeof revision !== "object" || Array.isArray(revision)) {
    return null;
  }

  const revisionInstructions =
    typeof revision.revisionInstructions === "string"
      ? revision.revisionInstructions.trim()
      : "";

  const currentItinerary = revision.currentItinerary;
  const hasItinerary =
    currentItinerary &&
    typeof currentItinerary === "object" &&
    !Array.isArray(currentItinerary) &&
    Array.isArray(currentItinerary.days) &&
    currentItinerary.days.length > 0;

  if (!revisionInstructions || !hasItinerary) {
    return null;
  }

  return { revisionInstructions, currentItinerary };
}

function buildUserPrompt(
  preferences,
  curatedContext,
  resolvedDurationDays,
  revision = null,
) {
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

  if (revision) {
    const curatedSection = curatedContext
      ? `
This trip was originally based on a curated template (for context only; follow the revision instructions and preferences first):
${JSON.stringify(curatedContext, null, 2)}
`
      : "";

    return `Revise the traveler's existing itinerary according to their instructions.

Rules:
- The itinerary MUST have exactly ${resolvedDurationDays} day(s): durationDays must be ${resolvedDurationDays} and days.length must be ${resolvedDurationDays}.
- Keep honoring the traveler preferences (destination, pace, budget, interests, must-sees, constraints) unless the revision instructions clearly require a conflicting change.
- Apply the revision instructions; leave other days and details stable when the user only asked to change part of the trip.
- Return one complete updated itinerary JSON object (not a partial diff or patch).
- Do not invent a completely unrelated trip.

Revision instructions:
${revision.revisionInstructions}

Current itinerary (JSON):
${JSON.stringify(revision.currentItinerary, null, 2)}

Traveler preferences (JSON):
${JSON.stringify(payload, null, 2)}${curatedSection}`;
  }

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

  return `Plan a new trip using these preferences (JSON).

Rules:
- The itinerary MUST have exactly ${resolvedDurationDays} day(s): durationDays must be ${resolvedDurationDays} and days.length must be ${resolvedDurationDays}.
- Match destination, pace, budget, interests, must-sees, and constraints from the preferences.

${JSON.stringify(payload, null, 2)}`;
}

function failure(code, message, details) {
  return { ok: false, code, message, ...(details ? { details } : {}) };
}

function isRetryableParseFailure(result) {
  return (
    result.code === "MALFORMED_JSON" || result.code === "INVALID_ITINERARY"
  );
}

async function requestOpenRouterCompletion(messages, fetchFn) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return failure(
      "MISSING_API_KEY",
      "OPENROUTER_API_KEY is not set. Add it to .env.local on the server.",
    );
  }

  const body = {
    model: ITINERARY_MODEL,
    messages,
    response_format: { type: "json_object" },
  };

  let response;
  try {
    response = await fetchFn(OPENROUTER_CHAT_URL, {
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
      signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      console.error("OpenRouter request timed out");
      return failure(
        "NETWORK_ERROR",
        "The itinerary request timed out. Please try again.",
      );
    }
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

  return { ok: true, content };
}

// revisionContext, when valid, revises currentItinerary instead of planning from scratch.
export async function generateItinerary(
  preferences,
  curatedContext = null,
  revisionContext = null,
  options = {},
) {
  const fetchFn = options.fetchFn ?? fetch;
  const resolvedPreferences = preferences ?? {};
  const resolvedDurationDays = Number(resolvedPreferences.durationDays);
  const revision = normalizeRevisionContext(revisionContext);
  if (!Number.isInteger(resolvedDurationDays) || resolvedDurationDays < 1) {
    return failure(
      "INVALID_DURATION",
      "Trip length must be resolved before generating an itinerary.",
    );
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(
        resolvedPreferences,
        curatedContext,
        resolvedDurationDays,
        revision,
      ),
    },
  ];

  let lastParseFailure = null;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const completion = await requestOpenRouterCompletion(messages, fetchFn);
    if (!completion.ok) {
      return completion;
    }

    const parsed = parseAndValidateModelItinerary(
      completion.content,
      resolvedDurationDays,
    );
    if (parsed.ok) {
      return parsed;
    }

    lastParseFailure = parsed;

    const canRetry =
      attempt < MAX_GENERATION_ATTEMPTS - 1 && isRetryableParseFailure(parsed);

    if (!canRetry) {
      console.error(
        "Itinerary generation failed:",
        parsed.code,
        parsed.message,
      );
      return parsed;
    }

    console.warn(
      "Itinerary validation failed; retrying once:",
      parsed.code,
      parsed.message,
    );

    messages.push({ role: "assistant", content: completion.content });
    messages.push({
      role: "user",
      content:
        parsed.code === "MALFORMED_JSON"
          ? buildMalformedJsonRetryUserMessage()
          : buildValidationRetryUserMessage(
              parsed.message,
              resolvedDurationDays,
            ),
    });
  }

  return (
    lastParseFailure ??
    failure("INVALID_ITINERARY", "Itinerary generation failed.")
  );
}
