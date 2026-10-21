import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DestinationCard({ destination, className, priority = false }) {
  return (
    <Link
      href={`/trips?destination=${destination.slug}`}
      className={cn("group/card block", className)}
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-[20px] border border-border/50 bg-background py-0 gap-0",
          "shadow-sm transition-[transform,box-shadow] duration-300 ease-out",
          "hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        <div className="relative aspect-[5/6] overflow-hidden">
          <Image
            src={destination.heroImageUrl}
            alt={destination.altText ?? destination.country}
            loading={priority ? "eager" : "lazy"}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent transition-all duration-300 group-hover/card:from-foreground/85 group-hover/card:via-foreground/25"
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h2 className="text-lg font-semibold tracking-tight text-background sm:text-xl">
              {destination.country}
            </h2>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                "grid-rows-[0fr] group-hover/card:grid-rows-[1fr]",
                "motion-reduce:grid-rows-[1fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "opacity-0 transition-opacity duration-300 ease-out group-hover/card:opacity-100",
                    "motion-reduce:opacity-100 motion-reduce:transition-none",
                  )}
                >
                  {destination.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-background/90">
                      {destination.description}
                    </p>
                  ) : null}

                  <p className="mt-3 text-xs font-medium text-background/80">
                    Explore trips →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
