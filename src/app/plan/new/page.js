import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { NewTripPlanner } from "../components/new-trip-planner";
import { PlannerShell } from "../components/planner-shell";
import { auth } from "@/lib/auth";
import { getDraftResumeState } from "@/lib/trips/draft-resume";

export const metadata = {
  title: "Plan a new trip",
  description: "Answer a few questions and generate a personalized itinerary with VoyaAI.",
};

export default async function PlanNewTripPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const { draft: draftParam } = resolvedSearch;

  const draftTripId =
    typeof draftParam === "string" && draftParam.trim()
      ? draftParam.trim()
      : undefined;

  let resume = null;
  let signInReturnUrl = "/plan/new";

  if (draftTripId) {
    signInReturnUrl = `/plan/new?draft=${encodeURIComponent(draftTripId)}`;
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (userId) {
      const state = await getDraftResumeState(draftTripId, userId);
      if (state.kind === "ready") {
        redirect(`/my-trips/${state.tripId}`);
      }
      if (state.kind === "resume") {
        if (state.curatedTripSlug) {
          redirect(
            `/plan?trip=${encodeURIComponent(state.curatedTripSlug)}&draft=${encodeURIComponent(draftTripId)}`,
          );
        }
        resume = {
          tripId: state.tripId,
          preferences: state.preferences,
        };
      }
    }
  }

  return (
    <PlannerShell backHref="/plan" backLabel="← Choose a different planning path">
      <NewTripPlanner
        draftResume={resume}
        signInReturnUrl={signInReturnUrl}
      />
    </PlannerShell>
  );
}
