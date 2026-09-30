import Image from "next/image";

import { TripPrompt } from "@/components/marketing/trip-prompt";
import { DESIGN } from "@/constants/design";

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80",
  alt: "Snow-capped mountains above a pine forest and alpine lake",
};

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
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/35 to-foreground/10 md:bg-gradient-to-r md:from-foreground/60 md:via-foreground/30 md:to-transparent" />

        <div className="relative z-10 flex min-h-[32rem] flex-col justify-end px-4 py-6 sm:min-h-[36rem] sm:px-8 sm:py-10 md:justify-center md:px-12 lg:min-h-[calc(100dvh-7.5rem)] lg:px-16 lg:py-16">
          <div className="w-full max-w-xl">
            <p className="text-[12px] font-medium tracking-[0.16em] text-background/80 sm:text-[13px]">
              AI TRAVEL PLANNER
            </p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-[1.08] tracking-tight text-background sm:mt-4 sm:text-5xl lg:text-6xl">
              Plan your next
              <span className="block">adventure.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-background/85 sm:mt-5 sm:text-base md:text-lg">
              Tell VoyaAI where you want to go. Get a thoughtful itinerary
              shaped around your dates, budget, and pace.
            </p>

            <div className="mt-6 sm:mt-8 md:mt-10">
              <TripPrompt />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
