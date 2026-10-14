"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function PlannerQuestionnaireFrame({
  steps,
  stepIndex,
  onGoToStep,
  onGoBack,
  onGoNext,
  onFinish,
  submitted,
  generating = false,
  header,
  firstStepBack,
  children,
}) {
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const currentStep = steps[stepIndex];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-border/50 bg-gradient-to-br from-secondary/45 via-card to-secondary/25",
        "shadow-sm"
      )}
    >
      <div className="border-b border-border/40 px-5 py-6 sm:px-8 sm:py-8">
        {header}

        <div className="mt-6">
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>
              Step {stepIndex + 1} of {steps.length}
              <span className="hidden sm:inline"> — {currentStep.title}</span>
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-indicator]]:transition-transform [&_[data-slot=progress-indicator]]:duration-300"
            value={progress}
            aria-valuenow={stepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label="Questionnaire progress"
          />
          <ol className="mt-4 flex flex-wrap gap-2" aria-label="Steps">
            {steps.map((step, index) => {
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (index <= stepIndex) onGoToStep(index);
                    }}
                    disabled={index > stepIndex}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs",
                      isActive && "bg-primary text-primary-foreground",
                      isComplete &&
                        !isActive &&
                        "bg-primary/15 text-primary hover:bg-primary/25",
                      !isActive &&
                        !isComplete &&
                        "bg-secondary text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-8 sm:py-9">
        {children}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            {stepIndex > 0 ? (
              <Button type="button" variant="outline" onClick={onGoBack}>
                Back
              </Button>
            ) : (
              firstStepBack
            )}
          </div>
          <div className="flex gap-3">
            {currentStep.id !== "review" ? (
              <Button type="button" onClick={onGoNext}>
                {currentStep.id === "extras" ? "Review answers" : "Continue"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onFinish}
                disabled={submitted || generating}
              >
                {generating
                  ? "Generating itinerary…"
                  : submitted
                    ? "Done"
                    : "Confirm preferences"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
