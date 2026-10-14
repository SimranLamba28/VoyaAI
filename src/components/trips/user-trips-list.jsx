"use client";

import { useState } from "react";
import Link from "next/link";

import { TripCatalogCard } from "@/components/trips/trip-catalog-card";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";

export function UserTripsList({ initialTrips }) {
  const [trips, setTrips] = useState(initialTrips);

  function handleTripDeleted(tripId) {
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  }

  if (trips.length === 0) {
    return (
      <div
        className="rounded-[18px] border border-border/40 bg-muted/30 px-6 py-12 text-center sm:px-10 sm:py-14"
      >
        <p className="text-base font-medium tracking-tight text-foreground">
          No trips yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          When you generate an itinerary from the planner, it will show up here
          so you can pick up where you left off.
        </p>
        <Link
          href="/plan"
          className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Start planning →
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4 sm:gap-5">
      {trips.map((trip) => (
        <li key={trip.id}>
          <div className="relative">
            <TripCatalogCard
              trip={trip.cardTrip}
              variant="list"
              href={trip.href}
              linkLabel={trip.linkLabel}
              statusBadge={trip.statusBadge}
              updatedAtText={trip.updatedAtText}
              showBudget={false}
              showDescription={false}
            />
            <div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
              <DeleteTripButton
                tripId={trip.id}
                onDeleted={handleTripDeleted}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
