"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { CuratedTripGrid } from "@/components/trips/curated-trip-grid";
import { Input } from "@/components/ui/input";

export function CuratedTripFilters({
  trips,
  destinations,
  initialDestination = "",
}) {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState(initialDestination);
  const [durations, setDurations] = useState([]);
  const [budgets, setBudgets] = useState([]);

  function toggleDuration(id) {
    setDurations((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  function toggleBudget(id) {
    setBudgets((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  }

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesDestination =
        !destination || trip.destination?.slug === destination;

      const matchesSearch =
        !query ||
        trip.title.toLowerCase().includes(query) ||
        (trip.location?.toLowerCase().includes(query) ?? false);

      const matchesDuration =
        durations.length === 0 ||
        durations.some((id) => {
          if (id === "1-5") {
            return trip.duration >= 1 && trip.duration <= 5;
          }

          if (id === "6-10") {
            return trip.duration >= 6 && trip.duration <= 10;
          }

          if (id === "10-plus") {
            return trip.duration >= 11;
          }

          return false;
        });

      const matchesBudget =
        budgets.length === 0 ||
        budgets.some((id) => {
          if (id === "under-75k") {
            return trip.budgetMax < 75000;
          }

          if (id === "75k-150k") {
            return trip.budgetMax <= 150000 && trip.budgetMin >= 75000;
          }

          if (id === "150k-plus") {
            return trip.budgetMin >= 150000 || trip.budgetMax > 150000;
          }

          return false;
        });

      return (
        matchesDestination &&
        matchesSearch &&
        matchesDuration &&
        matchesBudget
      );
    });
  }, [trips, destination, search, durations, budgets]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or location…"
            className="pl-10"
            aria-label="Search trips by title or location"
          />
        </div>
      </div>

        <CuratedTripGrid
          trips={filteredTrips}
          destinations={destinations}
          destination={destination}
          onDestinationChange={setDestination}
          durations={durations}
          budgets={budgets}
          toggleDuration={toggleDuration}
          toggleBudget={toggleBudget}
        />
      
    </div>
  );
}