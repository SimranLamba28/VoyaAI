import Image from "next/image";

import { cn } from "@/lib/utils";

const pageWrap = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

function EditorialImageBreak({
  src,
  alt,
  eyebrow,
  title,
  className,
  aspectClass = "aspect-[16/10] sm:aspect-[21/9]",
}) {
  if (!src) return null;

  return (
    <figure className={cn(pageWrap, "my-12 sm:my-14 lg:my-16", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          aspectClass,
          "rounded-[20px] shadow-sm"
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/15 to-transparent"
          aria-hidden="true"
        />
        {(eyebrow || title) && (
          <figcaption className="absolute inset-x-0 bottom-0 px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-background/75 sm:text-xs">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <p className="mt-1 max-w-2xl text-lg font-medium leading-snug tracking-tight text-background sm:text-xl lg:text-2xl">
                {title}
              </p>
            ) : null}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

export function TripOverview({
  trip,
  destination,
  budgetText,
  overviewLead,
  overviewSecondary,
}) {
  return (
    <>
      <section
        className={cn(pageWrap, "mt-12 sm:mt-14 lg:mt-16")}
        aria-labelledby="trip-overview-heading"
      >
        <div className="border-b border-border/60 pb-10 sm:pb-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <div className="lg:col-span-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
                Overview
              </p>
              <h2
                id="trip-overview-heading"
                className="relative mt-2 inline-block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
              >
                About this trip
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-10 rounded-full bg-primary/35 sm:w-12"
                  aria-hidden="true"
                />
              </h2>

              {overviewLead ? (
                <p className="mt-6 text-base leading-[1.7] text-foreground/90 sm:text-[17px]">
                  {overviewLead}
                </p>
              ) : null}

              {overviewSecondary ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
                  {overviewSecondary}
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-5">
              <div
                className="rounded-[18px] border border-border/50 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  At a glance
                </p>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
                      Destination
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
                      {destination?.name}
                      {destination?.country ? (
                        <span className="block font-normal text-muted-foreground sm:inline sm:before:content-['·_']">
                          {destination.country}
                        </span>
                      ) : null}
                    </dd>
                  </div>

                  {destination?.city ? (
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
                        Base city
                      </dt>
                      <dd className="mt-1.5 text-sm font-medium text-foreground sm:text-[15px]">
                        {destination.city}
                      </dd>
                    </div>
                  ) : null}

                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
                      Duration
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground sm:text-[15px]">
                      {trip.duration} days
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
                      Estimated budget
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium text-foreground sm:text-[15px]">
                      {budgetText}
                    </dd>
                  </div>

                  {trip.location ? (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/90">
                        Route
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-foreground sm:text-[15px]">
                        {trip.location}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {destination?.heroImage ? (
        <EditorialImageBreak
          src={destination.heroImage}
          alt={destination.altText ?? destination.name}
          eyebrow={destination.country ?? destination.name}
          title={destination.name}
        />
      ) : null}
    </>
  );
}
