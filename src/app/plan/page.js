import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { CuratedTripPlanner } from "./components/curated-trip-planner";
import { PlanEntry } from "./components/plan-entry";
import { PlannerShell } from "./components/planner-shell";
import { auth } from "@/lib/auth";
import { getDraftResumeState } from "@/lib/trips/draft-resume";
import { getCuratedTripBySlug } from "@/lib/trips/curated-trip-queries";

export const metadata = {
  title: "AI Planner",
  description:
    "Personalize a curated itinerary or plan a new trip from scratch with VoyaAI.",
};

export default async function PlanPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const { trip: tripSlug, draft: draftParam } = resolvedSearch;

  if (!tripSlug) {
    return <PlanEntry />;
  }

  const trip = await getCuratedTripBySlug(tripSlug, { forPlanner: true });

  if (!trip) {
    notFound();
  }

  const curatedDraftId =
    typeof draftParam === "string" && draftParam.trim()
      ? draftParam.trim()
      : undefined;

  let curatedResume = null;
  let curatedSignInUrl = `/plan?trip=${encodeURIComponent(trip.slug)}`;

  if (curatedDraftId) {
    curatedSignInUrl = `${curatedSignInUrl}&draft=${encodeURIComponent(curatedDraftId)}`;
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (userId) {
      const state = await getDraftResumeState(curatedDraftId, userId);
      if (state.kind === "ready") {
        redirect(`/my-trips/${state.tripId}`);
      }
      if (state.kind === "resume") {
        curatedResume = {
          tripId: state.tripId,
          preferences: state.preferences,
        };
      }
    }
  }

  const plannerTrip = {
    slug: trip.slug,
    title: trip.title,
    duration: trip.duration,
    location: trip.location,
    budgetMin: trip.budgetMin,
    budgetMax: trip.budgetMax,
    currency: trip.currency,
  };

  return (
    <PlannerShell backHref="/plan" backLabel="← Choose a different planning path">
      <CuratedTripPlanner
        trip={plannerTrip}
        draftResume={curatedResume}
        signInReturnUrl={curatedSignInUrl}
      />
    </PlannerShell>
  );
}
