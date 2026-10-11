import { Alert, AlertDescription } from "@/components/ui/alert";

function ReviewRow({ label, value }) {
  return (
    <div className="border-b border-border/40 py-3 last:border-0 sm:grid sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-4 sm:py-3.5">
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground sm:mt-0">{value}</dd>
    </div>
  );
}

export function PlannerReview({
  isNewTrip = false,
  tripTitle,
  tripSlug,
  destinationLabel,
  durationLabel,
  datesSummary,
  travelersSummary,
  budgetFormatted,
  interestLabels,
  paceLabel,
  mustSeeDisplay,
  constraintsDisplay,
  submitted,
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Review your answers
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Go back to any step to edit before continuing.
        </p>
      </div>
      <dl className="rounded-[12px] border border-border/50 bg-card/80 px-4 sm:px-5">
        {!isNewTrip ? (
          <>
            <ReviewRow label="Curated trip" value={tripTitle} />
            <ReviewRow label="Source slug" value={tripSlug} />
          </>
        ) : null}
        <ReviewRow label="Destination" value={destinationLabel} />
        <ReviewRow label="Duration" value={durationLabel} />
        <ReviewRow label="Dates" value={datesSummary} />
        <ReviewRow label="Travelers" value={travelersSummary} />
        <ReviewRow label="Budget" value={budgetFormatted} />
        <ReviewRow label="Interests" value={interestLabels} />
        <ReviewRow label="Pace" value={paceLabel} />
        <ReviewRow label="Must-sees" value={mustSeeDisplay} />
        <ReviewRow label="Constraints" value={constraintsDisplay} />
      </dl>
      {submitted ? (
        <Alert
          role="status"
          className="rounded-[12px] border-primary/30 bg-primary/5 px-4 py-3"
        >
          <AlertDescription className="text-sm text-foreground">
            Your answers are held for this session. AI itinerary generation
            isn&apos;t connected yet.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
