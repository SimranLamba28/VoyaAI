function inrFormatter(currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function formatCuratedTripBudgetText(trip) {
  const formatter = inrFormatter(trip.currency ?? "INR");

  if (trip.budgetMin != null && trip.budgetMax != null) {
    return `${formatter.format(trip.budgetMin)} - ${formatter.format(
      trip.budgetMax,
    )}`;
  }

  return "Budget varies";
}

export function formatUserTripBudgetText(trip, metadata = null) {
  const formatter = inrFormatter(trip.currency ?? "INR");

  if (metadata?.estimatedTotalBudgetInr != null) {
    return formatter.format(metadata.estimatedTotalBudgetInr);
  }

  if (trip.budgetMin != null && trip.budgetMax != null) {
    if (trip.budgetMin === trip.budgetMax) {
      return formatter.format(trip.budgetMin);
    }
    return `${formatter.format(trip.budgetMin)} - ${formatter.format(
      trip.budgetMax,
    )}`;
  }

  return "Budget varies";
}
