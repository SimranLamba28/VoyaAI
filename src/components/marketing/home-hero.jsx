import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DESIGN } from "@/constants/design";

export function HomeHero() {
  return (
    <section className="px-4 pb-6 pt-3 sm:px-6 sm:pb-8 sm:pt-4 lg:px-8 lg:pb-10">
      <div
        className="relative mx-auto min-h-[32rem] overflow-hidden sm:min-h-[36rem] lg:min-h-[calc(100dvh-7.5rem)]"
        style={{
          maxWidth: DESIGN.maxWidth,
          borderRadius: DESIGN.cardRadius,
        }}
      >
        <Image
          src="/images/home-hero.jpg"
          alt="Snow-capped mountains above a pine forest and alpine lake"
          fill
          fetchPriority="high"
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/35 to-foreground/10 md:bg-gradient-to-r md:from-foreground/60 md:via-foreground/30 md:to-transparent" />

        <div className="relative z-10 flex min-h-[32rem] flex-col justify-end px-4 py-6 sm:min-h-[36rem] sm:px-8 sm:py-10 md:justify-center md:px-12 lg:min-h-[calc(100dvh-7.5rem)] lg:px-16 lg:py-16">
          <div className="w-full max-w-xl lg:max-w-2xl">
            <p className="text-[12px] font-medium tracking-[0.16em] text-background/80 sm:text-[13px]">
              AI TRAVEL PLANNER
            </p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight text-background sm:mt-4 sm:text-5xl lg:text-6xl">
              Discover places worth travelling for.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-background/85 sm:mt-5 sm:text-base md:max-w-xl md:text-lg">
              Explore inspiring destinations, discover thoughtfully curated
              trips, and find your next adventure with VoyaAI.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center md:mt-10">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/destinations">Explore Destinations</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-background/30 bg-background/10 text-background hover:border-background/40 hover:bg-background/20 hover:text-background sm:w-auto"
              >
                <Link href="/plan">Plan a Trip</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
