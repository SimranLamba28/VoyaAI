"use client";

import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DESIGN } from "@/constants/design";
import { cn } from "@/lib/utils";

const FAQ_IMAGE = {
  src: "/images/Destinations/Switzerland.jpg",
  alt: "Alpine lake and mountains in Switzerland",
};

const FAQ_ITEMS = [
  {
    id: "create-itinerary",
    question: "How does VoyaAI create an itinerary?",
    answer:
      "You answer a short planner questionnaire—destination, trip length or dates, who is traveling, budget, interests, pace, and optional must-sees or notes. VoyaAI then uses AI to build a day-by-day plan with activities, summaries, and budget guidance shaped around what you shared.",
  },
  {
    id: "customize-curated",
    question: "Can I customize a curated trip?",
    answer:
      "Yes. From a curated trip, choose to personalize it with AI and complete the curated-trip questionnaire: travel dates (optional), travelers, budget, interests and pace, plus optional must-sees and notes. VoyaAI generates a personalized itinerary using that curated trip as inspiration—not a fixed copy of the catalog schedule.",
  },
  {
    id: "save-edit",
    question: "Can I save and edit my trips?",
    answer:
      "When you are signed in, trips you start or generate appear in My Trips as drafts or saved plans. Open any trip to view your day-by-day itinerary or continue in the planner where you left off. You can also adjust preferences in the planner and generate again when your answers change.",
  },
  {
    id: "regenerate",
    question: "Can I regenerate my itinerary?",
    answer:
      "On your trip itinerary page, open “Modify your itinerary,” describe what you want changed, and regenerate. You will see a preview of the revised plan first—your saved itinerary stays the same until you choose Save changes, or you can discard the preview.",
  },
  {
    id: "prices-hours",
    question: "Does VoyaAI guarantee prices or opening hours?",
    answer:
      "No. Figures, schedules, and venue details in your plan are AI-generated suggestions and are not verified in real time against live prices, availability, or opening hours. Confirm anything time-sensitive—tickets, reservations, transit, and hours—with official sources before you travel.",
  },
  {
    id: "pricing",
    question: "Is VoyaAI free to use?",
    answer:
      "VoyaAI does not list subscription fees or per-trip charges in the app today. Planning features such as saving trips and generating itineraries require a signed-in account. Any future pricing would be communicated on the site—we have not verified a long-term free tier beyond what is shown in the product now.",
  },
];

export function HomeTravelFaqs() {
  return (
    <section
      className="overflow-x-clip border-t border-border/40 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      aria-labelledby="home-faqs-heading"
    >
      <div
        className="mx-auto grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-x-10 lg:gap-x-12"
        style={{ maxWidth: DESIGN.maxWidth }}
      >
        <div className="min-w-0 md:max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            TRAVEL FAQS
          </p>

          <h2
            id="home-faqs-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Your questions, answered.
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Everything you need to know about planning your next trip with
            VoyaAI.
          </p>

          <Accordion
            type="single"
            collapsible
            className="mt-8 w-full min-w-0 rounded-none border-0"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={cn(
                  "border-0 border-b border-border/45 last:border-b-0",
                  "data-open:bg-transparent",
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "gap-4 py-4 pr-1 text-left text-sm font-medium leading-snug tracking-[-0.01em] text-foreground",
                    "hover:no-underline sm:text-[15px]",
                    "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  className="px-0 pb-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-relaxed [&_p]:mb-0"
                >
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div
          className="relative hidden aspect-[5/4] min-h-0 w-full overflow-hidden shadow-sm md:block md:aspect-auto md:min-h-[22rem] md:self-stretch"
          style={{ borderRadius: DESIGN.cardRadius }}
        >
          <Image
            src={FAQ_IMAGE.src}
            alt={FAQ_IMAGE.alt}
            fill
            sizes="(min-width: 768px) 42vw, 0px"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
