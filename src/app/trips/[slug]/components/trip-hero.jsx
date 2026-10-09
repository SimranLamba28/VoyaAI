import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Location01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

import { DESIGN } from "@/constants/design";

export function TripHero({ trip, destination, budgetText }) {
  return (
    <section className="px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div
        className="relative mx-auto min-h-[26rem] overflow-hidden sm:min-h-[30rem] lg:min-h-[36rem]"
        style={{
          maxWidth: DESIGN.maxWidth,
          borderRadius: DESIGN.cardRadius,
        }}
      >
        <Image
          src={trip.image}
          alt={trip.altText ?? trip.title}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/45 to-foreground/15 md:bg-gradient-to-r md:from-foreground/75 md:via-foreground/40 md:to-foreground/10"
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-[26rem] flex-col justify-between px-5 py-6 sm:min-h-[30rem] sm:px-8 sm:py-8 lg:min-h-[36rem] lg:px-12 lg:py-10">
          <div>
            <Link
              href="/trips"
              className="inline-flex items-center text-[13px] font-medium text-background/75 transition-colors hover:text-background"
            >
              ← Curated trips
            </Link>
          </div>

          <div className="mt-auto max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-background/75 sm:text-xs">
              {destination?.name ?? "Curated journey"}
            </p>

            <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight text-background sm:text-4xl lg:text-[2.75rem] lg:leading-[1.06]">
              {trip.title}
            </h1>

            {trip.location ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-background/85 sm:text-base">
                <HugeiconsIcon
                  icon={Location01Icon}
                  strokeWidth={1.75}
                  className="mt-0.5 size-4 shrink-0 opacity-90"
                  aria-hidden="true"
                />
                <span>{trip.location}</span>
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-background/90">
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={1.75}
                  className="size-4 opacity-90"
                  aria-hidden="true"
                />
                {trip.duration} days
              </span>
              <span
                className="hidden h-1 w-1 rounded-full bg-background/50 sm:inline-block"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-2">
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  strokeWidth={1.75}
                  className="size-4 opacity-90"
                  aria-hidden="true"
                />
                <span>
                  <span className="text-background/70">Est. </span>
                  {budgetText}
                </span>
              </span>
            </div>

            {trip.description ? (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-background/88 sm:text-base sm:leading-relaxed">
                {trip.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
