"use client";

import { useState } from "react";
import { Dialog } from "radix-ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONFIRM_MESSAGE =
  "Are you sure you want to permanently delete this trip? This action cannot be undone.";

export function DeleteTripButton({ tripId, onDeleted, className }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleConfirmDelete() {
    setDeleting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}`, {
        method: "DELETE",
      });

      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok || !body?.ok) {
        const message =
          body?.message ??
          "Could not delete this trip. Please try again in a moment.";
        setErrorMessage(message);
        setDeleting(false);
        return;
      }

      setOpen(false);
      onDeleted?.(tripId);
    } catch {
      setErrorMessage(
        "Could not reach the server. Check your connection and try again.",
      );
      setDeleting(false);
    }
  }

  function handleOpenChange(nextOpen) {
    if (deleting) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            className,
          )}
          aria-label="Delete trip"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/80 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-[18px] border border-border/40 bg-background p-6 shadow-lg",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Dialog.Title className="text-base font-medium tracking-tight text-foreground">
            Delete trip?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {CONFIRM_MESSAGE}
          </Dialog.Description>

          {errorMessage ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={(event) => event.stopPropagation()}
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={(event) => {
                event.stopPropagation();
                handleConfirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete trip"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
