import "server-only";

/**
 * Canonical AI itinerary JSON contract.
 * Enforced by validateItinerary() after the model responds.
 *
 * Field mapping when persisting to Prisma:
 * - summary → TripItinerary.description
 * - day.summary → TripItineraryDay.description
 * - estimatedTotalBudgetInr, budgetNotes, importantNotes → TripItinerary.metadata
 */

export const ITINERARY_JSON_EXAMPLE = {
  title: "Coastal Goa Escape",
  destination: "Goa, India",
  durationDays: 2,
  summary:
    "A relaxed two-day introduction to North Goa's beaches and Portuguese heritage.",
  estimatedTotalBudgetInr: 45000,
  budgetNotes:
    "Includes mid-range hotels, local meals, and activities; excludes flights.",
  importantNotes: [
    "Carry sunscreen and light cotton clothing year-round.",
  ],
  days: [
    {
      dayNumber: 1,
      title: "Arrival and beach time",
      summary: "Settle in and unwind by the sea.",
      activities: [
        {
          title: "Calangute Beach walk",
          description: "Gentle stroll along the shore at sunset.",
          location: "Calangute",
          timeOfDay: "Evening",
        },
      ],
      mealSuggestions: [
        {
          name: "Fish thali at a beach shack",
          description: "Fresh catch with rice and local sides.",
          mealType: "dinner",
        },
      ],
    },
    {
      dayNumber: 2,
      title: "Heritage in Panjim",
      summary: "Explore Latin Quarter lanes and riverside views.",
      activities: [
        {
          title: "Fontainhas walking tour",
          description: "Colorful houses and cafés in the old quarter.",
          location: "Panjim",
          timeOfDay: "Morning",
        },
      ],
      mealSuggestions: [],
    },
  ],
};

const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateActivity(activity, path) {
  if (!activity || typeof activity !== "object") {
    return `${path}: expected an object`;
  }
  if (!isNonEmptyString(activity.title)) {
    return `${path}.title must be a non-empty string`;
  }
  if (!isNonEmptyString(activity.description)) {
    return `${path}.description must be a non-empty string`;
  }
  if (typeof activity.location !== "string") {
    return `${path}.location must be a string`;
  }
  if (typeof activity.timeOfDay !== "string") {
    return `${path}.timeOfDay must be a string`;
  }
  return null;
}

function validateMeal(meal, path) {
  if (!meal || typeof meal !== "object") {
    return `${path}: expected an object`;
  }
  if (!isNonEmptyString(meal.name)) {
    return `${path}.name must be a non-empty string`;
  }
  if (!isNonEmptyString(meal.description)) {
    return `${path}.description must be a non-empty string`;
  }
  if (!MEAL_TYPES.has(meal.mealType)) {
    return `${path}.mealType must be one of: breakfast, lunch, dinner, snack`;
  }
  return null;
}

function validateDay(day, index, expectedDayNumber) {
  const path = `days[${index}]`;

  if (!day || typeof day !== "object") {
    return `${path}: expected an object`;
  }
  if (!Number.isInteger(day.dayNumber)) {
    return `${path}.dayNumber must be an integer`;
  }
  if (day.dayNumber !== expectedDayNumber) {
    return `${path}.dayNumber must be ${expectedDayNumber}, got ${day.dayNumber}`;
  }
  if (!isNonEmptyString(day.title)) {
    return `${path}.title must be a non-empty string`;
  }
  if (!isNonEmptyString(day.summary)) {
    return `${path}.summary must be a non-empty string`;
  }
  if (!Array.isArray(day.activities)) {
    return `${path}.activities must be an array`;
  }
  if (day.activities.length === 0) {
    return `${path}.activities must include at least one activity`;
  }
  for (let i = 0; i < day.activities.length; i++) {
    const err = validateActivity(day.activities[i], `${path}.activities[${i}]`);
    if (err) return err;
  }
  if (!Array.isArray(day.mealSuggestions)) {
    return `${path}.mealSuggestions must be an array`;
  }
  for (let i = 0; i < day.mealSuggestions.length; i++) {
    const err = validateMeal(
      day.mealSuggestions[i],
      `${path}.mealSuggestions[${i}]`,
    );
    if (err) return err;
  }
  return null;
}

/**
 * @param {unknown} data Parsed JSON from the model
 * @param {number} [expectedDurationDays] Resolved trip length from traveler preferences
 * @returns {{ valid: true, itinerary: object } | { valid: false, error: string }}
 */
export function validateItinerary(data, expectedDurationDays) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: "Itinerary must be a JSON object" };
  }

  if (!isNonEmptyString(data.title)) {
    return { valid: false, error: "title must be a non-empty string" };
  }
  if (!isNonEmptyString(data.destination)) {
    return { valid: false, error: "destination must be a non-empty string" };
  }
  if (!Number.isInteger(data.durationDays) || data.durationDays < 1) {
    return {
      valid: false,
      error: "durationDays must be a positive integer",
    };
  }
  if (!isNonEmptyString(data.summary)) {
    return { valid: false, error: "summary must be a non-empty string" };
  }
  if (
    !Number.isInteger(data.estimatedTotalBudgetInr) ||
    data.estimatedTotalBudgetInr < 0
  ) {
    return {
      valid: false,
      error: "estimatedTotalBudgetInr must be a non-negative integer",
    };
  }
  if (!isNonEmptyString(data.budgetNotes)) {
    return { valid: false, error: "budgetNotes must be a non-empty string" };
  }
  if (!Array.isArray(data.days)) {
    return { valid: false, error: "days must be an array" };
  }
  if (data.days.length === 0) {
    return { valid: false, error: "days must not be empty" };
  }
  if (
    Number.isInteger(expectedDurationDays) &&
    expectedDurationDays > 0 &&
    data.days.length === expectedDurationDays &&
    data.durationDays !== expectedDurationDays
  ) {
    data.durationDays = expectedDurationDays;
  }
  if (data.days.length !== data.durationDays) {
    return {
      valid: false,
      error: `days length (${data.days.length}) must equal durationDays (${data.durationDays})`,
    };
  }
  for (let i = 0; i < data.days.length; i++) {
    const err = validateDay(data.days[i], i, i + 1);
    if (err) return { valid: false, error: err };
  }
  if (!Array.isArray(data.importantNotes)) {
    return { valid: false, error: "importantNotes must be an array" };
  }
  for (let i = 0; i < data.importantNotes.length; i++) {
    if (!isNonEmptyString(data.importantNotes[i])) {
      return {
        valid: false,
        error: `importantNotes[${i}] must be a non-empty string`,
      };
    }
  }

  if (
    Number.isInteger(expectedDurationDays) &&
    expectedDurationDays > 0 &&
    data.durationDays !== expectedDurationDays
  ) {
    return {
      valid: false,
      error: `durationDays (${data.durationDays}) must match requested trip length (${expectedDurationDays})`,
    };
  }

  return { valid: true, itinerary: data };
}
