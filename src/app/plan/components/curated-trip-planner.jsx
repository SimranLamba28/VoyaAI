"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  CURATED_STEPS,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
  TRAVELER_TYPES,
} from "../config/questionnaire";

import { formatInr } from "@/lib/format-inr";
import {
  formFromSavedPreferences,
  formatCuratedBudgetHint,
  generateItineraryAndGoToDraft,
  havePreferencesChangedSinceGeneration,
  normalizeTripPreferencesForApi,
  prepareTripPreferencesForGeneration,
} from "@/lib/trips/trip-preferences";
import { useItineraryGeneration } from "../hooks/use-itinerary-generation";
import { PlannerQuestionnaireFrame } from "./planner-questionnaire-frame";
import { PlannerReview } from "./planner-review";
import { PlannerStepContent } from "./planner-step-content";

function validateCuratedStep(stepId, form, catalogDurationDays) {
  switch (stepId) {
    case "dates": {
      const prepared = prepareTripPreferencesForGeneration(form, {
        defaultDurationDays: catalogDurationDays,
      });
      return prepared.ok ? "" : prepared.message;
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

export function CuratedTripPlanner({
  trip,
  draftResume = null,
  signInReturnUrl: signInReturnUrlProp,
}) {
  const router = useRouter();
  const steps = CURATED_STEPS;
  const signInReturnUrl =
    signInReturnUrlProp ?? `/plan?trip=${encodeURIComponent(trip.slug)}`;

  const initialTripId = draftResume?.tripId ?? null;

  const [stepIndex, setStepIndex] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [generatedPreferencesSnapshot, setGeneratedPreferencesSnapshot] =
    useState(null);

  const {
    loading: generating,
    error: generationError,
    needsSignIn,
    tripId: generationTripId,
    generate,
  } = useItineraryGeneration();

  const activeTripId = generationTripId ?? initialTripId;

  const catalogDurationDays =
    trip.duration != null && trip.duration !== "" ? trip.duration : null;

  const [form, setForm] = useState(() =>
    formFromSavedPreferences(draftResume?.preferences, {
      destination: trip.location?.trim() || trip.title?.trim() || "",
      durationDays:
        trip.duration != null && trip.duration !== ""
          ? String(trip.duration)
          : "",
    }),
  );

  const preferencesSnapshot = useMemo(
    () =>
      JSON.stringify(
        normalizeTripPreferencesForApi(form, {
          defaultDurationDays: catalogDurationDays,
        }),
      ),
    [form, catalogDurationDays],
  );

  const preferencesStale = havePreferencesChangedSinceGeneration(
    generatedPreferencesSnapshot,
    preferencesSnapshot,
  );

  const destinationLabel =
    trip.location?.trim() || trip.title?.trim() || "This trip";

  const catalogDurationLabel =
    trip.duration != null && trip.duration !== ""
      ? `${trip.duration} days`
      : "Duration from curated trip";

  const durationLabel = useMemo(() => {
    const days = normalizeTripPreferencesForApi(form, {
      defaultDurationDays: catalogDurationDays,
    }).durationDays;
    return days != null ? `${days} days` : "—";
  }, [form, catalogDurationDays]);

  const curatedBudgetHint = useMemo(
    () => formatCuratedBudgetHint(trip),
    [trip],
  );

  const stepError = useMemo(() => {
    if (!attemptedNext) return "";
    return validateCuratedStep(steps[stepIndex].id, form, catalogDurationDays);
  }, [stepIndex, form, attemptedNext, steps, catalogDurationDays]);

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
    const error = validateCuratedStep(step.id, form, catalogDurationDays);
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

  async function handleFinish() {
    const payload = normalizeTripPreferencesForApi(form, {
      defaultDurationDays: catalogDurationDays,
    });
    await generateItineraryAndGoToDraft({
      generate,
      preferences: payload,
      options: {
        tripId: activeTripId ?? undefined,
        curatedTripSlug: trip.slug,
      },
      preferencesSnapshot,
      setGeneratedSnapshot: setGeneratedPreferencesSnapshot,
      router,
    });
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
        <span className="text-foreground">{catalogDurationLabel}</span>. We&apos;ll
        personalize this curated route using your answers—the original trip in
        our catalog stays unchanged.
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
      submitted={false}
      generating={generating}
      header={header}
      firstStepBack={firstStepBack}
    >
      {currentStep.id === "review" ? (
        <PlannerReview
          isNewTrip={false}
          tripTitle={trip.title}
          destinationLabel={destinationLabel}
          durationLabel={durationLabel}
          datesSummary={datesSummary}
          travelersSummary={travelersSummary}
          budgetFormatted={formatInr(form.budgetInr)}
          interestLabels={interestLabels}
          paceLabel={paceLabel}
          mustSeeDisplay={form.mustSee.trim() || "—"}
          constraintsDisplay={form.constraints.trim() || "—"}
          generating={generating}
          generationError={generationError}
          needsSignIn={needsSignIn}
          signInReturnUrl={signInReturnUrl}
          preferencesStale={preferencesStale}
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
          durationLabel={catalogDurationLabel}
        />
      )}
    </PlannerQuestionnaireFrame>
  );
}
