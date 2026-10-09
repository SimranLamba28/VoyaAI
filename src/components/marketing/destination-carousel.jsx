import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { DESIGN } from "@/constants/design";

export function DestinationCarousel({ destinations }) {
  return (
    <section
      id="destinations"
      className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: DESIGN.maxWidth }}
      >
        {/* Heading */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Explore
          </p>

          <h2 className="relative mt-2 inline-block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Where will you go next?
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-10 rounded-full bg-primary/35 sm:w-14"
              aria-hidden="true"
            />
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-3.5 sm:text-[15px]">
            Find inspiration for your next adventure.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps",
            }}
            aria-label="Popular destinations"
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-5">
              {destinations.map((destination) => (
                <CarouselItem
                  key={destination.name}
                  className="basis-[132px] pl-3 sm:basis-[156px] sm:pl-4 md:basis-[172px] md:pl-5 lg:basis-[188px]"
                >
                  <article className="group/card flex flex-col items-center text-center">
                    <div
                      className="relative aspect-[3.5/5] w-full overflow-hidden rounded-[20px] bg-muted shadow-sm transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none group-hover/card:-translate-y-1 group-hover/card:shadow-md group-active/card:scale-[0.98] motion-reduce:group-hover/card:translate-y-0 motion-reduce:group-active/card:scale-100"
                    >
                      <Image
                        src={destination.heroImageUrl}
                        alt={destination.altText ?? destination.name}
                        fill
                        sizes="(min-width: 1024px) 188px, (min-width: 768px) 172px, (min-width: 640px) 156px, 132px"
                        className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover/card:scale-[1.05] motion-reduce:group-hover/card:scale-100"
                      />

                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-3 w-full text-sm font-medium tracking-[-0.01em] text-foreground transition-colors duration-200 group-hover/card:text-primary sm:mt-3.5 sm:text-[15px]">
                      {destination.name}
                    </h3>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              className="left-0 hidden size-10 border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-opacity duration-200 hover:bg-background disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-70 md:hover:opacity-100 md:focus-visible:opacity-100"
            />

            <CarouselNext
              className="right-0 hidden size-10 border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-opacity duration-200 hover:bg-background disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-70 md:hover:opacity-100 md:focus-visible:opacity-100"
            />
          </Carousel>

        </div>
      </div>
    </section>
  );
}
