"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  INTEREST_OPTIONS,
  PACE_OPTIONS,
  TRAVELER_TYPES,
} from "../config/questionnaire";

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function PlannerStepContent({
  stepId,
  isNewTrip = false,
  answers,
  onUpdateField,
  onToggleInterest,
  validationError,
  curatedBudgetHint,
  durationLabel,
}) {
  const inputInvalid = Boolean(validationError);

  if (stepId === "destination") {
    return (
      <div className="max-w-lg space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Where do you want to go?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Name your destination, then add travel dates if you already know them
            (optional).
          </p>
        </div>
        <div>
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            type="text"
            className="mt-2"
            placeholder="e.g. Darjeeling, Goa, Kyoto…"
            value={answers.destination}
            onChange={(e) => onUpdateField("destination", e.target.value)}
            aria-invalid={inputInvalid}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start-date-new">Start date (optional)</Label>
            <Input
              id="start-date-new"
              type="date"
              className="mt-2"
              value={answers.startDate}
              onChange={(e) => onUpdateField("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date-new">End date (optional)</Label>
            <Input
              id="end-date-new"
              type="date"
              className="mt-2"
              value={answers.endDate}
              onChange={(e) => onUpdateField("endDate", e.target.value)}
              min={answers.startDate || undefined}
            />
          </div>
        </div>
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "duration-travelers") {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            How long and who&apos;s traveling?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Trip length and group size help us balance activities and pacing.
          </p>
        </div>
        <div className="max-w-[10rem]">
          <Label htmlFor="duration-days">Duration (days)</Label>
          <Input
            id="duration-days"
            type="number"
            min={1}
            step={1}
            className="mt-2"
            placeholder="e.g. 5"
            value={answers.durationDays}
            onChange={(e) => onUpdateField("durationDays", e.target.value)}
            aria-invalid={inputInvalid}
          />
        </div>
        <div>
          <Label>Traveler type</Label>
          <RadioGroup
            className="mt-3"
            value={answers.travelerType}
            onValueChange={(v) => onUpdateField("travelerType", v)}
          >
            {TRAVELER_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-border/60 bg-card px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30"
              >
                <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="max-w-[10rem]">
          <Label htmlFor="traveler-count-dt">Number of travelers</Label>
          <Input
            id="traveler-count-dt"
            type="number"
            min={1}
            className="mt-2"
            value={answers.travelerCount}
            onChange={(e) => onUpdateField("travelerCount", e.target.value)}
            aria-invalid={inputInvalid}
          />
        </div>
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "dates") {
    return (
      <div className="max-w-lg space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            When are you thinking of going?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isNewTrip
              ? "Optional — skip if you're still deciding."
              : `Optional — skip if you're still deciding. We already know this trip is planned for ${durationLabel}.`}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start-date">Start date</Label>
            <Input
              id="start-date"
              type="date"
              className="mt-2"
              value={answers.startDate}
              onChange={(e) => onUpdateField("startDate", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End date</Label>
            <Input
              id="end-date"
              type="date"
              className="mt-2"
              value={answers.endDate}
              onChange={(e) => onUpdateField("endDate", e.target.value)}
              min={answers.startDate || undefined}
            />
          </div>
        </div>
        {!isNewTrip ? (
          <div className="max-w-[10rem]">
            <Label htmlFor="duration-days-curated">Trip length (days)</Label>
            <Input
              id="duration-days-curated"
              type="number"
              min={1}
              step={1}
              className="mt-2"
              placeholder="e.g. 5"
              value={answers.durationDays}
              onChange={(e) => onUpdateField("durationDays", e.target.value)}
            />
          </div>
        ) : null}
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "travelers") {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Who&apos;s traveling?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Helps us tune rooming, pace, and activity suggestions.
          </p>
        </div>
        <div>
          <Label>Traveler type</Label>
          <RadioGroup
            className="mt-3"
            value={answers.travelerType}
            onValueChange={(v) => onUpdateField("travelerType", v)}
          >
            {TRAVELER_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-border/60 bg-card px-4 py-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30"
              >
                <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="max-w-[10rem]">
          <Label htmlFor="traveler-count">Number of travelers</Label>
          <Input
            id="traveler-count"
            type="number"
            min={1}
            className="mt-2"
            value={answers.travelerCount}
            onChange={(e) => onUpdateField("travelerCount", e.target.value)}
            aria-invalid={inputInvalid}
          />
        </div>
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "budget") {
    return (
      <div className="max-w-lg space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            What&apos;s your total budget?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter an approximate all-in budget in Indian Rupees (INR).
            {curatedBudgetHint
              ? ` This curated trip is typically ${curatedBudgetHint}.`
              : null}
          </p>
        </div>
        <div>
          <Label htmlFor="budget-inr">Budget (INR)</Label>
          <Input
            id="budget-inr"
            type="number"
            min={1}
            step={1000}
            placeholder="e.g. 85000"
            className="mt-2"
            value={answers.budgetInr}
            onChange={(e) => onUpdateField("budgetInr", e.target.value)}
            aria-invalid={inputInvalid}
          />
        </div>
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "interests") {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Interests & travel pace
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll align highlights with what you enjoy and how busy you
            like your days.
          </p>
        </div>
        <div>
          <Label>Interests (select all that apply)</Label>
          <ul className="mt-3 space-y-2">
            {INTEREST_OPTIONS.map((option) => {
              const checked = answers.interests.includes(option.value);
              return (
                <li key={option.value}>
                  <label
                    className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-border/60 bg-card px-4 py-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggleInterest(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <Label>Travel pace</Label>
          <RadioGroup
            className="mt-3"
            value={answers.pace}
            onValueChange={(v) => onUpdateField("pace", v)}
          >
            {PACE_OPTIONS.map((pace) => (
              <label
                key={pace.value}
                className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border/60 bg-card px-4 py-3"
              >
                <RadioGroupItem
                  value={pace.value}
                  id={`pace-${pace.value}`}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium">{pace.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {pace.description}
                  </p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
        <FieldError message={validationError} />
      </div>
    );
  }

  if (stepId === "extras") {
    return (
      <div className="max-w-xl space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Must-sees & constraints
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Optional — add places you don&apos;t want to miss or anything we
            should plan around.
          </p>
        </div>
        <div>
          <Label htmlFor="must-see">Must-see places or experiences</Label>
          <Textarea
            id="must-see"
            rows={4}
            className="mt-2 min-h-0 resize-y rounded-[12px] border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-foreground/20 dark:bg-card"
            placeholder="e.g. sunrise at Tiger Hill, a tea estate visit…"
            value={answers.mustSee}
            onChange={(e) => onUpdateField("mustSee", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="constraints">Constraints or preferences</Label>
          <Textarea
            id="constraints"
            rows={4}
            className="mt-2 min-h-0 resize-y rounded-[12px] border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-foreground/20 dark:bg-card"
            placeholder="Dietary needs, mobility, avoid long drives…"
            value={answers.constraints}
            onChange={(e) => onUpdateField("constraints", e.target.value)}
          />
        </div>
      </div>
    );
  }

  return null;
}
