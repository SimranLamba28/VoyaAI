import { INITIAL_TRIP_PREFERENCES } from "@/app/plan/config/questionnaire";

const NUMERIC_PREFERENCE_FIELDS = ["durationDays", "budgetInr", "travelerCount"];

function trimDate(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function daysBetweenInclusive(startDate, endDate) {
  const startMs = Date.parse(`${startDate}T00:00:00.000Z`);
  const endMs = Date.parse(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) {
    return null;
  }
  return Math.floor((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1;
}

export function resolveTripDurationDays(preferences, defaultDurationDays = null) {
  if (!preferences || typeof preferences !== "object") {
    return null;
  }

  const start = trimDate(preferences.startDate);
  const end = trimDate(preferences.endDate);

  if (start && end) {
    const fromDates = daysBetweenInclusive(start, end);
    return fromDates != null && fromDates >= 1 ? fromDates : null;
  }

  const entered = Number(preferences.durationDays);
  if (Number.isInteger(entered) && entered > 0) {
    return entered;
  }

  const fallback = Number(defaultDurationDays);
  if (Number.isInteger(fallback) && fallback > 0) {
    return fallback;
  }
  return null;
}

/** Resolve duration for API / generation. Returns an error message when invalid. */
export function prepareTripPreferencesForGeneration(preferences, options = {}) {
  const defaultDurationDays = options.defaultDurationDays ?? null;
  const start = trimDate(preferences.startDate);
  const end = trimDate(preferences.endDate);
  const resolved = resolveTripDurationDays(preferences, defaultDurationDays);

  if (start && end && resolved == null) {
    return {
      ok: false,
      message: "End date must be on or after the start date.",
    };
  }
  if (resolved == null) {
    return {
      ok: false,
      message: "Enter trip length in whole days (at least 1).",
    };
  }

  return {
    ok: true,
    preferences: { ...preferences, durationDays: resolved },
  };
}

export function normalizeTripPreferencesForApi(preferences, options = {}) {
  const normalized = { ...preferences };

  for (const field of NUMERIC_PREFERENCE_FIELDS) {
    const value = normalized[field];
    if (value === "" || value == null) {
      continue;
    }
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) {
      normalized[field] = asNumber;
    }
  }

  const resolvedDuration = resolveTripDurationDays(
    normalized,
    options.defaultDurationDays ?? null,
  );
  if (resolvedDuration != null) {
    normalized.durationDays = resolvedDuration;
  }

  return normalized;
}

export function formFromSavedPreferences(saved, defaults = {}) {
  const base = {
    ...INITIAL_TRIP_PREFERENCES,
    ...defaults,
    interests: [
      ...(Array.isArray(defaults.interests)
        ? defaults.interests
        : INITIAL_TRIP_PREFERENCES.interests),
    ],
  };
  if (!saved) {
    return base;
  }

  for (const key of Object.keys(INITIAL_TRIP_PREFERENCES)) {
    const value = saved[key];
    if (value === undefined || value == null) {
      continue;
    }
    if (key === "interests" && Array.isArray(value)) {
      base.interests = value.map(String);
    } else if (
      key === "durationDays" ||
      key === "budgetInr" ||
      key === "travelerCount"
    ) {
      base[key] = String(value);
    } else {
      base[key] = String(value);
    }
  }
  return base;
}

export function formatCuratedBudgetHint(trip) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: trip.currency ?? "INR",
    maximumFractionDigits: 0,
  });
  if (trip.budgetMin != null && trip.budgetMax != null) {
    return `${formatter.format(trip.budgetMin)} - ${formatter.format(trip.budgetMax)}`;
  }
  return null;
}

export function havePreferencesChangedSinceGeneration(
  generatedSnapshot,
  currentSnapshot,
) {
  return (
    generatedSnapshot !== null && currentSnapshot !== generatedSnapshot
  );
}

export async function generateItineraryAndGoToDraft({
  generate,
  preferences,
  options,
  preferencesSnapshot,
  setGeneratedSnapshot,
  router,
}) {
  const result = await generate(preferences, options);
  if (result.ok) {
    setGeneratedSnapshot(preferencesSnapshot);
    if (result.tripId) {
      router.push(`/plan/draft/${result.tripId}`);
    }
  }
  return result;
}
