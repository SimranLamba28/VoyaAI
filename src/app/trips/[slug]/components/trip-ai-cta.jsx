import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function TripCustomizeCta({ trip }) {
  const planHref = `/plan?trip=${encodeURIComponent(trip.slug)}`;

  return (
    <section
      className={cn(pageWrap, "mt-10 sm:mt-12")}
      aria-labelledby="trip-customize-heading"
    >
      <div
        className="rounded-[18px] border border-border/50 bg-card/80 px-5 py-5 shadow-sm sm:px-6 sm:py-6"
      >
        <h2
          id="trip-customize-heading"
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Make this trip yours
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Personalize this curated itinerary with your dates, budget, and
          preferences in a short questionnaire.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link href={planHref}>Customize with AI</Link>
          </Button>
          <Link
            href="/trips"
            className="text-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-left"
          >
            Browse more trips
          </Link>
        </div>
      </div>
    </section>
  );
}
