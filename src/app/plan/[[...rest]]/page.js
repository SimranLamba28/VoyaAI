import Link from "next/link";
import { notFound } from "next/navigation";

import { CuratedTripPlanner } from "../components/curated-trip-planner";
import { NewTripPlanner } from "../components/new-trip-planner";
import { PlanEntry } from "../components/plan-entry";
import { prisma } from "@/lib/prisma";

async function getTripBySlug(slug) {
  return prisma.curatedTrip.findUnique({
    where: { slug },
    include: {
      destination: true,
    },
  });
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
  const { trip: tripSlug } = await searchParams;

  if (segment === "new") {
    return (
      <PlannerShell backHref="/plan" backLabel="← Choose a different planning path">
        <NewTripPlanner />
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
        <CuratedTripPlanner trip={plannerTrip} />
      </PlannerShell>
    );
  }

  return <PlanEntry />;
}
