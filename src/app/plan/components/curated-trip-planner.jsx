"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  CURATED_STEPS,
  INITIAL_TRIP_PREFERENCES,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
  TRAVELER_TYPES,
} from "../config/questionnaire";
import { formatInr } from "../lib/format-inr";
import { PlannerQuestionnaireFrame } from "./planner-questionnaire-frame";
import { PlannerReview } from "./planner-review";
import { PlannerStepContent } from "./planner-step-content";

function validateCuratedStep(stepId, form) {
  switch (stepId) {
    case "dates": {
      if (form.startDate && form.endDate && form.startDate > form.endDate) {
        return "End date must be on or after the start date.";
      }
      return "";
    }
    case "travelers": {
      if (!form.travelerType) return "Select who is traveling.";
      const count = Number(form.travelerCount);
      if (!form.travelerCount || Number.isNaN(count) || count < 1) {
        return "Enter how many travelers (at least 1).";
      }
      return "";
    }
    case "budget": {
      const budget = Number(form.budgetInr);
      if (form.budgetInr === "" || Number.isNaN(budget) || budget < 1) {
        return "Enter your total trip budget in INR.";
      }
      return "";
    }
    case "interests": {
      if (form.interests.length === 0) {
        return "Select at least one interest.";
      }
      if (!form.pace) return "Choose a travel pace.";
      return "";
    }
    default:
      return "";
  }
}

export function CuratedTripPlanner({ trip }) {
  const steps = CURATED_STEPS;

  const [stepIndex, setStepIndex] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState(() => ({
    ...INITIAL_TRIP_PREFERENCES,
    interests: [...INITIAL_TRIP_PREFERENCES.interests],
  }));

  const destinationLabel =
    trip.location?.trim() || trip.title?.trim() || "This trip";

  const durationLabel =
    trip.duration != null && trip.duration !== ""
      ? `${trip.duration} days`
      : "Duration from curated trip";

  const curatedBudgetHint = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: trip.currency ?? "INR",
      maximumFractionDigits: 0,
    });
    if (trip.budgetMin != null && trip.budgetMax != null) {
      return `${formatter.format(trip.budgetMin)} - ${formatter.format(trip.budgetMax)}`;
    }
    return null;
  }, [trip.budgetMin, trip.budgetMax, trip.currency]);

  const stepError = useMemo(() => {
    if (!attemptedNext) return "";
    return validateCuratedStep(steps[stepIndex].id, form);
  }, [stepIndex, form, attemptedNext, steps]);

  const validationError = attemptedNext ? stepError : "";

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(value) {
    setForm((prev) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((v) => v !== value)
          : [...prev.interests, value],
      };
    });
  }

  function goNext() {
    const step = steps[stepIndex];
    const error = validateCuratedStep(step.id, form);
    if (error) {
      setAttemptedNext(true);
      return;
    }
    setAttemptedNext(false);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setAttemptedNext(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function goToStep(index) {
    setAttemptedNext(false);
    setStepIndex(index);
  }

  function handleFinish() {
    setSubmitted(true);
  }

  const currentStep = steps[stepIndex];

  const travelerTypeLabel =
    TRAVELER_TYPES.find((t) => t.value === form.travelerType)?.label ?? "—";

  const interestLabels =
    form.interests
      .map((v) => INTEREST_OPTIONS.find((o) => o.value === v)?.label)
      .filter(Boolean)
      .join(", ") || "—";

  const paceLabel =
    PACE_OPTIONS.find((p) => p.value === form.pace)?.label ?? "—";

  const datesSummary =
    form.startDate || form.endDate
      ? [form.startDate || "—", form.endDate || "—"].join(" → ")
      : "Not specified";

  const travelersSummary = `${travelerTypeLabel} · ${form.travelerCount} ${
    Number(form.travelerCount) === 1 ? "person" : "people"
  }`;

  const header = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
        Curated starting point
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Customize {trip.title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Based on <span className="text-foreground">{destinationLabel}</span>
        {" · "}
        <span className="text-foreground">{durationLabel}</span>. Your answers
        stay tied to this curated route (
        <span className="font-mono text-xs text-muted-foreground">
          {trip.slug}
        </span>
        ).
      </p>
    </>
  );

  const firstStepBack = (
    <Button type="button" variant="outline" asChild>
      <Link href={`/trips/${trip.slug}`}>Back to trip</Link>
    </Button>
  );

  return (
    <PlannerQuestionnaireFrame
      steps={steps}
      stepIndex={stepIndex}
      onGoToStep={goToStep}
      onGoBack={goBack}
      onGoNext={goNext}
      onFinish={handleFinish}
      submitted={submitted}
      header={header}
      firstStepBack={firstStepBack}
    >
      {currentStep.id === "review" ? (
        <PlannerReview
          isNewTrip={false}
          tripTitle={trip.title}
          tripSlug={trip.slug}
          destinationLabel={destinationLabel}
          durationLabel={durationLabel}
          datesSummary={datesSummary}
          travelersSummary={travelersSummary}
          budgetFormatted={formatInr(form.budgetInr)}
          interestLabels={interestLabels}
          paceLabel={paceLabel}
          mustSeeDisplay={form.mustSee.trim() || "—"}
          constraintsDisplay={form.constraints.trim() || "—"}
          submitted={submitted}
        />
      ) : (
        <PlannerStepContent
          stepId={currentStep.id}
          isNewTrip={false}
          answers={form}
          onUpdateField={updateField}
          onToggleInterest={toggleInterest}
          validationError={validationError}
          curatedBudgetHint={curatedBudgetHint}
          durationLabel={durationLabel}
        />
      )}
    </PlannerQuestionnaireFrame>
  );
}
