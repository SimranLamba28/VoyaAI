"use client";

import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { CuratedTripCard } from "@/components/trips/curated-trip-card";

export function CuratedTripCarousel({ trips }) {
  const [api, setApi] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section className="overflow-x-clip py-16" aria-labelledby="curated-trips-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
            Curated trips
          </p>

          <h2
            id="curated-trips-heading"
            className="mt-2 text-2xl font-medium tracking-[-0.02em] text-foreground md:text-3xl"
          >
            Trips worth taking
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Discover thoughtfully planned journeys to inspiring destinations.
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 items-center py-6">
            {trips.map((trip, index) => (
              <CarouselItem
                key={trip.id}
                className="basis-[250px] pl-4 md:basis-[290px]"
              >
                <CuratedTripCard
                  trip={trip}
                  active={index === selectedIndex}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Desktop/tablet only */}
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}