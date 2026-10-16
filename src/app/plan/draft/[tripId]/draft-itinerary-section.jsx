"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { ImportantNotesSection } from "@/app/plan/components/important-notes-section";
import { useItineraryGeneration } from "@/app/plan/hooks/use-itinerary-generation";
import { ItineraryDay } from "@/components/itinerary/itinerary-day";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { serializeDayActivitiesPayload } from "@/lib/trips/itinerary-day-data";
import { cn } from "@/lib/utils";

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

export function DraftItinerarySection({
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

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        "mt-2 sm:mt-4",
      )}
      aria-labelledby="draft-itinerary-heading"
    >
      <header className="max-w-3xl border-b border-border/35 pb-7 sm:pb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
          Itinerary
        </p>
        <h2
          id="draft-itinerary-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]"
        >
          {itineraryTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
          Your AI-generated plan—refresh this page anytime to pick up where you
          left off.
        </p>
      </header>

      <div
        className="mt-8 max-w-3xl space-y-4 rounded-[12px] border border-border/50 bg-card/80 p-4 sm:p-5"
        aria-labelledby="revision-panel-heading"
      >
        <div>
          <h3
            id="revision-panel-heading"
            className="text-base font-semibold text-foreground"
          >
            Revise this itinerary
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe what you want changed. We will show a preview before
            anything is saved.
          </p>
        </div>

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
            onChange={(event) => setRevisionInstructions(event.target.value)}
            placeholder="Example: Make day 2 more relaxed and add more local food experiences."
            rows={4}
            disabled={busy}
            className="min-h-[6.5rem] text-sm sm:text-[15px]"
          />
        </div>

        <Button
          type="button"
          onClick={handleRegenerate}
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

      {hasPreview ? (
        <div className="mt-10 sm:mt-12">
          <Alert className="max-w-3xl">
            <AlertDescription className="text-sm text-foreground">
              Preview only—your saved itinerary is unchanged until you save.
            </AlertDescription>
          </Alert>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              onClick={handleSaveChanges}
              disabled={busy}
            >
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
            <Alert variant="destructive" className="mt-4 max-w-3xl">
              <AlertDescription className="text-sm">{saveError}</AlertDescription>
            </Alert>
          ) : null}

          <header className="mt-8 max-w-3xl border-b border-border/35 pb-6 sm:pb-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary sm:text-xs">
              Preview
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {previewItinerary.title ?? "Revised plan"}
            </h3>
            {previewItinerary.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
                {previewItinerary.summary}
              </p>
            ) : null}
          </header>

          <ol className="mt-8 sm:mt-10">
            {previewDays.map((day, dayIndex) => (
              <ItineraryDay
                key={day.id}
                day={day}
                dayIndex={dayIndex}
                media={media}
              />
            ))}
          </ol>

          <ImportantNotesSection
            notes={previewNotes}
            className="mt-12 sm:mt-14"
          />
        </div>
      ) : (
        <>
          <ol className="mt-8 sm:mt-10">
            {savedDays.map((day, dayIndex) => (
              <ItineraryDay
                key={day.id}
                day={day}
                dayIndex={dayIndex}
                media={media}
              />
            ))}
          </ol>

          <ImportantNotesSection
            notes={importantNotes}
            className="mt-12 sm:mt-14"
          />
        </>
      )}
    </section>
  );
}
