"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const DURATIONS = [
  { id: "1-5", label: "1–5 days" },
  { id: "6-10", label: "6–10 days" },
  { id: "10-plus", label: "10+ days" },
];

const BUDGETS = [
  { id: "under-75k", label: "Under ₹75,000" },
  { id: "75k-150k", label: "₹75,000–₹1,50,000" },
  { id: "150k-plus", label: "₹1,50,000+" },
];

const sectionTitleClassName =
  "text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground";

const optionLabelClassName =
  "cursor-pointer font-normal text-sm text-muted-foreground transition-colors hover:text-foreground";

function fieldId(prefix, name) {
  return prefix ? `${prefix}-${name}` : name;
}

function FilterPanel({
  idPrefix = "",
  className,
  destinations,
  destination,
  onDestinationChange,
  durations,
  budgets,
  toggleDuration,
  toggleBudget,
}) {
  const destinationOptions = [
    { id: "all", value: "all", label: "All destinations" },
    ...destinations.map((dest) => ({
      id: dest.id,
      value: dest.slug,
      label: dest.name,
    })),
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <section>
        <h3 className={sectionTitleClassName}>Destination</h3>

        <RadioGroup
          value={destination || "all"}
          onValueChange={(value) =>
            onDestinationChange(value === "all" ? "" : value)
          }
          className="mt-3.5 gap-2.5"
          aria-label="Filter by destination"
        >
          {destinationOptions.map((option) => {
            const id = fieldId(idPrefix, `dest-${option.id}`);

            return (
              <div
                key={option.id}
                className="group/field-label flex items-center gap-2.5"
              >
                <RadioGroupItem value={option.value} id={id} />

                <Label htmlFor={id} className={optionLabelClassName}>
                  {option.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </section>

      <Separator />

      <section>
        <h3 className={sectionTitleClassName}>Duration</h3>

        <div
          className="mt-3.5 space-y-2.5"
          role="group"
          aria-label="Filter by duration"
        >
          {DURATIONS.map((duration) => {
            const id = fieldId(
              idPrefix,
              `duration-${duration.id}`
            );

            return (
              <div
                key={duration.id}
                className="group/field-label flex items-center gap-2.5"
              >
                <Checkbox
                  id={id}
                  checked={durations.includes(duration.id)}
                  onCheckedChange={() =>
                    toggleDuration(duration.id)
                  }
                />

                <Label
                  htmlFor={id}
                  className={optionLabelClassName}
                >
                  {duration.label}
                </Label>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className={sectionTitleClassName}>Budget</h3>

        <div
          className="mt-3.5 space-y-2.5"
          role="group"
          aria-label="Filter by budget"
        >
          {BUDGETS.map((budget) => {
            const id = fieldId(
              idPrefix,
              `budget-${budget.id}`
            );

            return (
              <div
                key={budget.id}
                className="group/field-label flex items-center gap-2.5"
              >
                <Checkbox
                  id={id}
                  checked={budgets.includes(budget.id)}
                  onCheckedChange={() =>
                    toggleBudget(budget.id)
                  }
                />

                <Label
                  htmlFor={id}
                  className={optionLabelClassName}
                >
                  {budget.label}
                </Label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function TripFilters({
  className,
  destinations,
  destination,
  onDestinationChange,
  durations,
  budgets,
  toggleDuration,
  toggleBudget,
}) {
  return (
    <aside
      className={cn(
        "w-full lg:w-52 lg:shrink-0",
        className
      )}
      aria-label="Trip filters"
    >
      <FilterPanel
        idPrefix="desktop"
        destinations={destinations}
        destination={destination}
        onDestinationChange={onDestinationChange}
        durations={durations}
        budgets={budgets}
        toggleDuration={toggleDuration}
        toggleBudget={toggleBudget}
      />
    </aside>
  );
}

export function MobileTripFilters({
  className,
  destinations,
  destination,
  onDestinationChange,
  durations,
  budgets,
  toggleDuration,
  toggleBudget,
}) {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-[13px] font-medium tracking-[-0.01em] text-foreground transition-colors duration-150 outline-none hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
          className
        )}
      >
        <HugeiconsIcon
          icon={FilterHorizontalIcon}
          size={15}
          strokeWidth={1.5}
        />

        Filters
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[min(100%,20rem)] sm:max-w-xs"
      >
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          <FilterPanel
            idPrefix="mobile"
            destinations={destinations}
            destination={destination}
            onDestinationChange={onDestinationChange}
            durations={durations}
            budgets={budgets}
            toggleDuration={toggleDuration}
            toggleBudget={toggleBudget}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}