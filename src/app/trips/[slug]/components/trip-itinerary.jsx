import { cn } from "@/lib/utils";

import { ItineraryDay } from "./itinerary-day";

const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function TripItinerary({ trip, itineraryDays }) {
  return (
    <section
      className={cn(pageWrap, "mt-2 sm:mt-4")}
      aria-labelledby="itinerary-heading"
    >
      <header className="max-w-3xl border-b border-border/35 pb-7 sm:pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
          Itinerary
        </p>
        <h2
          id="itinerary-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
        >
          {trip.itinerary?.title ?? "Day by day"}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
          A thoughtfully paced outline you can adapt with VoyaAI—swap stops,
          shift the rhythm, and tune the journey to your style.
        </p>
      </header>

      {itineraryDays.length > 0 ? (
        <ol className="mt-8 sm:mt-10">
          {itineraryDays.map((day, dayIndex) => (
            <ItineraryDay
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              media={trip.media}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          A detailed day-by-day plan is coming soon for this journey.
        </p>
      )}
    </section>
  );
}
