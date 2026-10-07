import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CuratedTripCard({ trip, active, variant = "carousel" }) {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: trip.currency,
    maximumFractionDigits: 0,
  });

  const budgetText =
    trip.budgetMin != null && trip.budgetMax != null
      ? `${formatter.format(trip.budgetMin)} – ${formatter.format(
          trip.budgetMax
        )}`
      : "Budget varies";

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "group/card relative overflow-hidden rounded-[18px] border border-border/40 bg-background py-0 gap-0",
          "shadow-sm transition-[box-shadow,transform] duration-300 ease-out",
          "hover:-translate-y-px hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        )}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 overflow-hidden",
            "w-[42%] sm:w-[40%] lg:w-[34%]"
          )}
        >
          <Image
            src={trip.image}
            alt={trip.altText ?? trip.title}
            fill
            sizes="(min-width: 1024px) 34vw, (min-width: 640px) 40vw, 42vw"
            className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent from-[35%] via-background/40 via-[75%] to-background"
            aria-hidden="true"
          />
        </div>

        <div
          className={cn(
            "relative flex min-w-0 flex-col",
            "pl-[44%] sm:pl-[41%] lg:pl-[36%]",
            "py-3.5 pr-3.5 sm:py-4 sm:pr-5 md:py-4 md:pr-6"
          )}
        >
          <h2
            className={cn(
              "line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-foreground",
              "sm:text-[17px] sm:leading-normal"
            )}
          >
            {trip.title}
          </h2>

          <p className="mt-1 truncate text-[13px] text-muted-foreground sm:text-sm">
            {trip.location}
          </p>

          <div
            className={cn(
              "mt-2.5 flex flex-col gap-1 text-xs text-muted-foreground",
              "sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1"
            )}
          >
            <span className="shrink-0">{trip.duration} days</span>
            <span className="hidden text-border sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="min-w-0">
              <span className="text-[11px] tracking-wide text-muted-foreground/80">
                Estimated budget{" "}
              </span>
              <span className="font-medium text-foreground break-words">
                {budgetText}
              </span>
            </span>
          </div>

          <p
            className={cn(
              "mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground",
              "sm:mt-3 sm:line-clamp-3 sm:text-sm"
            )}
          >
            {trip.description}
          </p>

          <Link
            href={`/trips/${trip.slug}`}
            className={cn(
              "mt-3 inline-block w-fit text-[13px] text-muted-foreground underline-offset-4",
              "transition-colors hover:text-foreground hover:underline sm:mt-3.5 sm:text-sm"
            )}
          >
            View trip →
          </Link>
        </div>
      </Card>
    );
  }

  const isCarousel = active !== undefined;

  return (
    <Card
      className={cn(
        "relative mx-auto w-[250px] shrink-0 overflow-hidden rounded-[20px] border border-border/50 bg-background py-0 gap-0 md:w-[290px]",
        isCarousel
          ? cn(
              "transition-all duration-700 ease-out",
              active
                ? "scale-100 opacity-100 shadow-lg"
                : "translate-y-2 scale-[0.94] opacity-65 shadow-sm"
            )
          : "shadow-sm"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trip.image}
          alt={trip.altText ?? trip.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 250px, 290px"
        />
      </div>

      <CardContent className="p-4">
        <CardTitle className="tracking-[0.02em] text-foreground">
          {trip.title}
        </CardTitle>

        <CardDescription className="mt-1">
          {trip.location}
        </CardDescription>

        <p className="mt-3 min-h-[3.75rem] text-xs leading-5 text-muted-foreground">
          {trip.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {trip.duration} days
          </span>
        </div>

        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground">
            Estimated budget
          </span>

          <p className="text-sm font-medium text-foreground">
            {budgetText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
