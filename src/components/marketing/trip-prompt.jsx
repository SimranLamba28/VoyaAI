"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DESIGN } from "@/constants/design";

const DEFAULT_SUGGESTIONS = [
  "7 days in Japan",
  "Honeymoon under ₹2 lakh",
  "Mountains and cafés",
];

export function TripPrompt({
  suggestions = DEFAULT_SUGGESTIONS,
  placeholder = "Plan a trip to Kyoto…",
}) {
  const [prompt, setPrompt] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-card p-1.5 shadow-sm"
        style={{ borderRadius: DESIGN.cardRadius }}
      >
        <label htmlFor="trip-prompt" className="sr-only">
          Describe the trip you want to plan
        </label>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              strokeWidth={1.5}
              className="shrink-0 text-muted-foreground"
            />
            <Input
              id="trip-prompt"
              name="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={placeholder}
              className="h-11 border-0 bg-transparent px-0 shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0"
            />
          </div>
          <Button type="submit" className="h-11 w-full shrink-0 px-5 sm:w-auto">
            <HugeiconsIcon
              icon={MagicWand01Icon}
              size={16}
              strokeWidth={1.5}
            />
            Plan my trip
          </Button>
        </div>
      </form>

      <ul className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        {suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-background/25 bg-background/10 px-3 py-1.5 text-[12px] tracking-[0.02em] text-background transition-colors duration-150 hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/50 sm:text-[13px]"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
