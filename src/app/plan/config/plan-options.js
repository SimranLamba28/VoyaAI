import {
  Location01Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons";

export const PLAN_OPTIONS = [
  {
    id: "curated",
    eyebrow: "Curated starting point",
    title: "Customize a curated trip",
    description:
      "Pick a thoughtfully planned route and refine it with AI—adjust days, budget, pace, and highlights to match how you actually travel.",
    ctaLabel: "Choose a trip",
    icon: MagicWand01Icon,
    image: {
      src:
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80",
      alt: "Scenic road through mountains at golden hour",
    },
  },
  {
    id: "scratch",
    eyebrow: "Your destination",
    title: "Plan from scratch",
    description:
      "Name where you want to go and build a personalized itinerary from the ground up—dates, interests, and budget shaped around you.",
    ctaLabel: "Pick a destination",
    icon: Location01Icon,
    image: {
      src:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
      alt: "Travel map, journal, and camera on a wooden table",
    },
  },
];
