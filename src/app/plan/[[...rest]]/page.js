import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { CuratedTripPlanner } from "../components/curated-trip-planner";
import { NewTripPlanner } from "../components/new-trip-planner";
import { PlanEntry } from "../components/plan-entry";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTripBySlug(slug) {
  return prisma.curatedTrip.findUnique({
    where: { slug },
    include: {
      destination: true,
    },
  });
}

/**
 * @param {string} draftTripId
 * @param {string} userId
 */
async function getDraftResumeState(draftTripId, userId) {
  const trip = await prisma.trip.findFirst({
    where: { id: draftTripId, userId },
    include: {
      itinerary: { select: { id: true } },
      curatedTrip: { select: { slug: true } },
    },
  });

  if (!trip) {
    return { kind: "missing" };
  }

  if (trip.itinerary) {
    return { kind: "ready", tripId: trip.id };
  }

  const preferences =
    trip.preferences &&
    typeof trip.preferences === "object" &&
    !Array.isArray(trip.preferences)
      ? trip.preferences
      : null;

  return {
    kind: "resume",
    tripId: trip.id,
    preferences,
    curatedTripSlug: trip.curatedTrip?.slug ?? null,
  };
}

export const metadata = {
  title: "AI Planner",
  description:
    "Personalize a curated itinerary or plan a new trip from scratch with VoyaAI.",
};

function PlannerShell({ backHref, backLabel, children }) {
  return (
    <main className="pb-14 sm:pb-16 lg:pb-20">
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-sm text-muted-foreground">
            <Link
              href={backHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {backLabel}
            </Link>
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}

export default async function PlanPage({ params, searchParams }) {
  const resolvedParams = await params;
  const segment = resolvedParams?.rest?.[0];
  const resolvedSearch = await searchParams;
  const { trip: tripSlug, draft: draftParam } = resolvedSearch;

  const draftTripId =
    typeof draftParam === "string" && draftParam.trim()
      ? draftParam.trim()
      : undefined;

  if (segment === "new") {
    let resume = null;
    let signInReturnUrl = "/plan/new";

    if (draftTripId) {
      signInReturnUrl = `/plan/new?draft=${encodeURIComponent(draftTripId)}`;
      const session = await auth.api.getSession({ headers: await headers() });
      const userId = session?.user?.id;

      if (userId) {
        const state = await getDraftResumeState(draftTripId, userId);
        if (state.kind === "ready") {
          redirect(`/plan/draft/${state.tripId}`);
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

  if (segment) {
    notFound();
  }

  if (tripSlug) {
    const trip = await getTripBySlug(tripSlug);

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
          redirect(`/plan/draft/${state.tripId}`);
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

  return <PlanEntry />;
}
