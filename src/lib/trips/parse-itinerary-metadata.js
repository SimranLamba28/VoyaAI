export function parseTripItineraryMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {
      estimatedTotalBudgetInr: null,
      budgetNotes: null,
      importantNotes: [],
    };
  }

  const estimated = Number(metadata.estimatedTotalBudgetInr);
  const estimatedTotalBudgetInr =
    Number.isInteger(estimated) && estimated >= 0 ? estimated : null;

  const budgetNotes =
    typeof metadata.budgetNotes === "string" && metadata.budgetNotes.trim()
      ? metadata.budgetNotes.trim()
      : null;

  const importantNotes = Array.isArray(metadata.importantNotes)
    ? metadata.importantNotes.filter(
        (note) => typeof note === "string" && note.trim().length > 0,
      )
    : [];

  return {
    estimatedTotalBudgetInr,
    budgetNotes,
    importantNotes,
  };
}
