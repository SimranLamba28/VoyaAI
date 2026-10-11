import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PLAN_OPTIONS } from "../config/plan-options";

function PlanOptionCard({ option }) {
  const headingId = `plan-option-${option.id}`;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[20px] border border-border/50 bg-gradient-to-br from-secondary/45 via-card to-secondary/25",
        "shadow-sm"
      )}
      aria-labelledby={headingId}
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[5/3]">
        <Image
          src={option.image.src}
          alt={option.image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
          <span
            className="inline-flex size-11 items-center justify-center rounded-full border border-background/20 bg-background/15 text-background backdrop-blur-sm sm:size-12"
            aria-hidden="true"
          >
            <HugeiconsIcon
              icon={option.icon}
              strokeWidth={1.75}
              className="size-5"
            />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-7 sm:px-7 sm:py-8 lg:px-8 lg:py-9">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
          {option.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {option.title}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
          {option.description}
        </p>
        <div className="mt-7 sm:mt-8">
          {option.id === "curated" ? (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/trips">{option.ctaLabel}</Link>
            </Button>
          ) : (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/plan/new">Start planning</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function PlanEntry() {
  return (
    <main className="pb-14 sm:pb-16 lg:pb-20">
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 max-w-2xl sm:mb-12 lg:mb-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
              Plan with AI
            </p>

            <h1 className="relative mt-2 inline-block text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              How would you like to start?
              <span
                className="absolute -bottom-1 left-0 h-0.5 w-12 rounded-full bg-primary/35 sm:w-16"
                aria-hidden="true"
              />
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
              VoyaAI can personalize an existing itinerary or build a new one
              around a destination you choose. Select an approach below—both
              paths lead to a trip shaped around your dates, budget, and pace.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {PLAN_OPTIONS.map((option) => (
              <PlanOptionCard key={option.id} option={option} />
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
