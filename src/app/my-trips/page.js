import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { UserTripsList } from "@/components/trips/user-trips-list";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_HERO_IMAGE = "/images/Destinations/Italy.jpg";

export const metadata = {
  title: "My Trips",
  description: "View and continue your personalized travel plans.",
};

async function getUserTrips(userId) {
  return prisma.trip.findMany({
    where: {
      userId,
      status: { in: ["draft", "saved"] },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      destination: true,
      duration: true,
      status: true,
      updatedAt: true,
      curatedTrip: {
        select: { image: true, altText: true },
      },
      itinerary: {
        select: {
          _count: { select: { days: true } },
          days: {
            take: 1,
            orderBy: { dayNumber: "asc" },
            select: { imageUrl: true },
          },
        },
      },
    },
  });
}

function tripHeroImage(trip) {
  if (trip.curatedTrip?.image) {
    return trip.curatedTrip.image;
  }
  const dayImage = trip.itinerary?.days?.[0]?.imageUrl;
  if (dayImage) {
    return dayImage;
  }
  return DEFAULT_HERO_IMAGE;
}

function hasCompletedItinerary(trip) {
  const dayCount = trip.itinerary?._count?.days ?? 0;
  return dayCount > 0;
}

function statusBadgeForTrip(trip) {
  if (!hasCompletedItinerary(trip)) {
    return { text: "Incomplete", tone: "warning" };
  }
  if (trip.status === "saved") {
    return { text: "Saved", tone: "default" };
  }
  return { text: "Draft", tone: "default" };
}

function formatUpdatedAt(date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function toCardTrip(trip) {
  return {
    title: trip.title,
    location: trip.destination,
    duration: trip.duration,
    image: tripHeroImage(trip),
    altText: trip.curatedTrip?.altText ?? trip.title,
  };
}

export default async function MyTripsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/plan");
  }

  const trips = await getUserTrips(session.user.id);

  return (
    <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-12 lg:mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Your plans
          </p>

          <h1 className="relative mt-2 inline-block text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            My Trips
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-12 rounded-full bg-primary/35 sm:w-16"
              aria-hidden="true"
            />
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Trips you have started or generated. Open any trip to view your
            itinerary or continue planning.
          </p>
        </header>

        <UserTripsList
          initialTrips={trips.map((trip) => {
            const complete = hasCompletedItinerary(trip);

            return {
              id: trip.id,
              cardTrip: toCardTrip(trip),
              href: `/plan/draft/${trip.id}`,
              linkLabel: complete ? "View trip →" : "Continue in planner →",
              statusBadge: statusBadgeForTrip(trip),
              updatedAtText: `Updated ${formatUpdatedAt(trip.updatedAt)}`,
            };
          })}
        />
      </div>
    </main>
  );
}
