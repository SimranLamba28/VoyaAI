import {
  CuratedTripFilterSidebar,
  CuratedTripFilterSidebarMobile,
} from "@/components/trips/curated-trip-filter-sidebar";
import { TripCatalogCard } from "@/components/trips/trip-catalog-card";

export function CuratedTripGrid({
  trips,
  destinations,
  destination,
  onDestinationChange,
  durations,
  budgets,
  toggleDuration,
  toggleBudget,
}) {
  return (
    <div className="w-full">
      <div className="mb-6 lg:hidden">
        <CuratedTripFilterSidebarMobile
          destination={destination}
          destinations={destinations}
          onDestinationChange={onDestinationChange}
          durations={durations}
          budgets={budgets}
          toggleDuration={toggleDuration}
          toggleBudget={toggleBudget}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <CuratedTripFilterSidebar
          className="hidden lg:block"
          destinations={destinations}
          destination={destination}
          onDestinationChange={onDestinationChange}
          durations={durations}
          budgets={budgets}
          toggleDuration={toggleDuration}
          toggleBudget={toggleBudget}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <TripCatalogCard
                key={trip.id}
                trip={trip}
                variant="list"
              />
            ))
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No trips match your filters. Try adjusting your search or destination.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}