import Link from "next/link";

import { TripPrompt } from "@/components/marketing/trip-prompt";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function TripAiCta({ trip, budgetText }) {
  return (
    <section
      className={cn(pageWrap, "mt-12 sm:mt-14 lg:mt-16")}
      aria-labelledby="plan-with-ai-heading"
    >
      <div
        className="overflow-hidden rounded-[20px] border border-border/50 bg-gradient-to-br from-secondary/50 via-card to-secondary/30 px-5 py-10 sm:px-8 sm:py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 lg:py-14 xl:px-14"
      >
        <div className="lg:pr-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Plan with AI
          </p>
          <h2
            id="plan-with-ai-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Make this trip yours
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
            Use this curated route as a starting point. Tell VoyaAI your dates,
            budget, and preferences—we&apos;ll shape a personalized itinerary
            around {trip.title}.
          </p>
          <div className="mt-6 hidden lg:block">
            <Button asChild variant="outline">
              <Link href="/trips">Browse more trips</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 lg:mt-0">
          <TripPrompt
            placeholder={`Customize “${trip.title}” for my dates…`}
            suggestions={[
              `${trip.duration} days like this trip`,
              `Similar trip under ${budgetText.split("–")[0]?.trim() ?? "my budget"}`,
              trip.location
                ? `Focus on ${trip.location.split("·")[0]?.trim()}`
                : "Add more free time",
            ]}
          />
          <div className="mt-6 flex justify-center lg:hidden">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/trips">Browse more trips</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
