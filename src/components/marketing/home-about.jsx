import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  MagicWand01Icon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";

import { DESIGN } from "@/constants/design";

const ABOUT_IMAGE = {
  src: "/images/Destinations/New-zealand.jpg",
  alt: "Scenic mountain lake and peaks in New Zealand",
};

const BENEFITS = [
  {
    icon: MagicWand01Icon,
    title: "Personalized itineraries",
    description:
      "Day-by-day plans built around your dates, budget, interests, and pace.",
  },
  {
    icon: Folder01Icon,
    title: "Your trips, saved in one place",
    description: "Drafts and saved itineraries together in My Trips.",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Flexible trip customization",
    description:
      "Start from a curated trip or your destination, then refine as you go.",
  },
];

function AboutImage({ className }) {
  return (
    <div
      className={className}
      style={{ borderRadius: DESIGN.cardRadius }}
    >
      <Image
        src={ABOUT_IMAGE.src}
        alt={ABOUT_IMAGE.alt}
        fill
        sizes="(min-width: 768px) 42vw, 100vw"
        className="object-cover object-[center_42%]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export function HomeAbout() {
  return (
    <section
      className="px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10 lg:px-8 lg:pt-8 lg:pb-12"
      aria-labelledby="home-about-heading"
    >
      <div
        className="mx-auto grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:items-stretch md:gap-x-10 md:gap-y-6 lg:gap-x-12"
        style={{ maxWidth: DESIGN.maxWidth }}
      >
        <div className="min-w-0 md:col-start-1 md:row-start-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            About VoyaAI
          </p>

          <h2
            id="home-about-heading"
            className="relative mt-2 inline-block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Travel planning, made personal.
            <span
              className="absolute -bottom-1 left-0 h-0.5 w-10 rounded-full bg-primary/35 sm:w-14"
              aria-hidden="true"
            />
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-[15px]">
            Discover inspiring destinations and create itineraries shaped around
            your travel dates, budget, interests, and pace.
          </p>
        </div>

        <AboutImage
          className="relative aspect-[4/3] min-h-[11.5rem] w-full overflow-hidden shadow-sm sm:min-h-[12.5rem] md:col-start-2 md:row-span-2 md:row-start-1 md:aspect-auto md:min-h-[22rem] md:h-full"
        />

        <ul className="min-w-0 space-y-3 md:col-start-1 md:row-start-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex items-start gap-3">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-9"
                aria-hidden="true"
              >
                <HugeiconsIcon
                  icon={benefit.icon}
                  size={17}
                  strokeWidth={1.75}
                />
              </span>
              <div className="min-w-0 flex-1 pt-px">
                <p className="text-sm font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-[15px]">
                  {benefit.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
