"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { ImportantNotesSection } from "@/app/plan/components/important-notes-section";
import { useItineraryGeneration } from "@/app/plan/hooks/use-itinerary-generation";
import { ItineraryDay } from "@/components/itinerary/itinerary-day";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { serializeDayActivitiesPayload } from "@/lib/trips/itinerary-day-data";
import { cn } from "@/lib/utils";

const contentColumn = "mx-auto w-full max-w-3xl min-w-0";

function messageFromSaveErrorBody(body) {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const message = body.message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return "Could not save your itinerary. Please try again.";
}

function previewDaysForDisplay(itinerary) {
  return (itinerary.days ?? []).map((day) => ({
    id: `preview-day-${day.dayNumber}`,
    dayNumber: day.dayNumber,
    title: day.title,
    description: day.summary,
    activities: serializeDayActivitiesPayload(day),
  }));
}

function importantNotesFromItinerary(itinerary) {
  if (!Array.isArray(itinerary.importantNotes)) {
    return [];
  }
  return itinerary.importantNotes.filter(
    (note) => typeof note === "string" && note.trim().length > 0,
  );
}

function RevisionFormPanel({
  revisionInstructions,
  onRevisionChange,
  onRegenerate,
  canRegenerate,
  loading,
  busy,
  error,
  needsSignIn,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="mt-5 rounded-[12px] border border-border/50 bg-card/60"
    >
      <CollapsibleTrigger
        type="button"
        className="w-full cursor-pointer px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/30 sm:px-5"
      >
        <span className="flex items-center justify-between gap-3">
          <span>Modify your itinerary</span>
          <span
            className={cn(
              "text-xs font-normal text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          >
            ▾
          </span>
        </span>
        <span className="mt-0.5 block text-xs font-normal leading-relaxed text-muted-foreground">
          Describe changes and preview a new version before saving.
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-3 border-t border-border/40 px-4 py-4 sm:space-y-4 sm:px-5 sm:py-5">
          <div className="space-y-2">
            <label
              htmlFor="revision-instructions"
              className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
            >
              What should change?
            </label>
            <Textarea
              id="revision-instructions"
              value={revisionInstructions}
              onChange={(event) => onRevisionChange(event.target.value)}
              placeholder="Example: Make day 2 more relaxed and add more local food experiences."
              rows={4}
              disabled={busy}
              className="min-h-[6.5rem] text-sm sm:text-[15px]"
            />
          </div>

          <Button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate}
          >
            {loading ? "Regenerating…" : "Regenerate itinerary"}
          </Button>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ) : null}

          {needsSignIn ? (
            <Alert>
              <AlertDescription className="text-sm text-foreground">
                Sign in to regenerate your itinerary.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TripItinerarySection({
  tripId,
  itineraryTitle,
  savedDays,
  importantNotes,
  media,
}) {
  const router = useRouter();
  const { loading, error, needsSignIn, generate } = useItineraryGeneration();
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [previewItinerary, setPreviewItinerary] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveInFlightRef = useRef(false);

  const busy = loading || saving;
  const hasPreview = previewItinerary != null;
  const canRegenerate = revisionInstructions.trim().length > 0 && !busy;

  async function handleRegenerate() {
    const instructions = revisionInstructions.trim();
    if (!instructions || busy) {
      return;
    }

    setSaveError(null);
    const result = await generate(null, {
      tripId,
      revisionInstructions: instructions,
    });

    if (result.ok && result.itinerary) {
      setPreviewItinerary(result.itinerary);
    }
  }

  function handleDiscardPreview() {
    if (busy) {
      return;
    }
    setPreviewItinerary(null);
    setSaveError(null);
  }

  async function handleSaveChanges() {
    if (!previewItinerary || busy || saveInFlightRef.current) {
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary: previewItinerary }),
      });

      let body;
      try {
        body = await response.json();
      } catch {
        setSaveError(
          "The server returned a response that could not be read. Please try again.",
        );
        return;
      }

      if (!response.ok) {
        setSaveError(messageFromSaveErrorBody(body));
        return;
      }

      setPreviewItinerary(null);
      router.refresh();
    } catch {
      setSaveError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  }

  const previewDays = hasPreview ? previewDaysForDisplay(previewItinerary) : [];
  const previewNotes = hasPreview
    ? importantNotesFromItinerary(previewItinerary)
    : [];

  const daysToRender = hasPreview ? previewDays : savedDays;
  const notesToRender = hasPreview ? previewNotes : importantNotes;

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        "mt-6 sm:mt-8",
      )}
      aria-labelledby="trip-itinerary-heading"
    >
      <div className={contentColumn}>
        <header className="border-b border-border/35 pb-5 sm:pb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
            Itinerary
          </p>
          <h2
            id="trip-itinerary-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
          >
            {itineraryTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
            Your AI-generated plan—refresh this page anytime to pick up where you
            left off.
          </p>

          <RevisionFormPanel
            revisionInstructions={revisionInstructions}
            onRevisionChange={setRevisionInstructions}
            onRegenerate={handleRegenerate}
            canRegenerate={canRegenerate}
            loading={loading}
            busy={busy}
            error={error}
            needsSignIn={needsSignIn}
          />
        </header>

        {hasPreview ? (
          <div className="mt-5 space-y-4">
            <Alert>
              <AlertDescription className="text-sm text-foreground">
                Preview only—your saved itinerary is unchanged until you save.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="button" onClick={handleSaveChanges} disabled={busy}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscardPreview}
                disabled={busy}
              >
                Discard preview
              </Button>
            </div>

            {saveError ? (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{saveError}</AlertDescription>
              </Alert>
            ) : null}

            <header className="border-b border-border/35 pb-4 pt-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
                Preview
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {previewItinerary.title ?? "Revised plan"}
              </h3>
              {previewItinerary.summary ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
                  {previewItinerary.summary}
                </p>
              ) : null}
            </header>
          </div>
        ) : null}

        <ol className="mt-6 sm:mt-7">
          {daysToRender.map((day, dayIndex) => (
            <ItineraryDay
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              media={media}
              compact
            />
          ))}
        </ol>

        <ImportantNotesSection
          notes={notesToRender}
          className="mt-8 sm:mt-9"
        />
      </div>
    </section>
  );
}
