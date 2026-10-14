import { cn } from "@/lib/utils";

export function ImportantNotesSection({ notes, className }) {
  if (!notes?.length) return null;

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border/50 bg-secondary/30 px-4 py-4 sm:px-5",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Good to know
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
