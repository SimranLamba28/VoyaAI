/**
 * @param {unknown} raw
 * @returns {object[]}
 */
export function parseDayActivities(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === "object" && Array.isArray(raw.activities)) {
    return raw.activities;
  }
  return [];
}

/**
 * @param {unknown} raw
 * @returns {object[]}
 */
export function parseDayMealSuggestions(raw) {
  if (raw && typeof raw === "object" && Array.isArray(raw.mealSuggestions)) {
    return raw.mealSuggestions;
  }
  return [];
}

/**
 * @param {{ activities?: unknown[], mealSuggestions?: unknown[] }} day
 */
export function serializeDayActivitiesPayload(day) {
  const activities = Array.isArray(day.activities) ? day.activities : [];
  const mealSuggestions = Array.isArray(day.mealSuggestions)
    ? day.mealSuggestions
    : [];

  if (mealSuggestions.length === 0) {
    return activities;
  }

  return {
    activities,
    mealSuggestions,
  };
}
