import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

function getActivities(day) {
  const raw = day.activities;
  if (!Array.isArray(raw)) return [];

  return [...raw].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
}

/** 0 = content + image (image right), 1 = reversed, 2 = cinematic */
function getDayLayoutVariant(dayNumber) {
  return (dayNumber - 1) % 3;
}

function dayItineraryFrameClassName(variant) {
  const isCinematic = variant === 2;

  return cn(
    "group relative overflow-hidden rounded-[18px]",
    isCinematic
      ? "min-h-[16rem] w-full sm:min-h-[20rem] lg:min-h-[26rem]"
      : "min-h-[16rem] w-full sm:min-h-[18rem] lg:min-h-0 lg:aspect-[4/5] lg:min-h-[28rem]"
  );
}

function EditorialVideo({ src, alt }) {
  if (!src) return null;

  const variant = 2;

  return (
    <div className={dayItineraryFrameClassName(variant)}>
      <video
        suppressHydrationWarning
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={alt}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

function DayItineraryImage({ src, alt, variant }) {
  if (!src) return null;

  const isCinematic = variant === 2;

  return (
    <div className={dayItineraryFrameClassName(variant)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      {isCinematic ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

function ItineraryDayActivities({ day, activities }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Activities for this day will be added soon.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-0 sm:mt-8">
      {activities.map((activity, activityIndex) => (
        <li
          key={`${day.id}-${activityIndex}`}
          className={cn(
            "relative border-l-2 border-primary/25 py-5 pl-5 sm:pl-6",
            activityIndex === 0 && "pt-0",
            activityIndex === activities.length - 1 && "pb-0"
          )}
        >
          <div
            className="absolute -left-[5px] top-5 size-2 rounded-full bg-primary/80 ring-4 ring-background"
            aria-hidden="true"
          />

          {activity.type ? (
            <span
              className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary"
            >
              {activity.type}
            </span>
          ) : null}

          <p className="mt-2 text-base font-medium leading-snug text-foreground sm:text-[17px]">
            {activity.title}
          </p>

          {activity.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.7]">
              {activity.description}
            </p>
          ) : null}

          {activity.location ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={Location01Icon}
                strokeWidth={1.75}
                className="size-3.5 shrink-0 opacity-80"
                aria-hidden="true"
              />
              {activity.location}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ItineraryDayHeader({ day }) {
  return (
    <header>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
        Day {day.dayNumber}
      </p>
      <p
        className="mt-2 text-4xl font-semibold tabular-nums leading-none tracking-tight text-primary/20 sm:text-5xl"
        aria-hidden="true"
      >
        {String(day.dayNumber).padStart(2, "0")}
      </p>
      <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl lg:text-[1.65rem]">
        {day.title}
      </h3>
      {day.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.75]">
          {day.description}
        </p>
      ) : null}
    </header>
  );
}

function getEditorialVideoUrl(dayNumber, media) {
  const placement =
    dayNumber === 3
      ? "before-day-3"
      : dayNumber === 6
        ? "before-day-6"
        : null;

  if (!placement) return null;

  const item = (media ?? []).find((entry) => entry.placement === placement);
  return item?.url ?? null;
}

export function ItineraryDay({ day, dayIndex, media }) {
  const activities = getActivities(day);
  const layout = getDayLayoutVariant(day.dayNumber);
  const imageAlt = `${day.title} — day ${day.dayNumber}`;
  const videoUrl = getEditorialVideoUrl(day.dayNumber, media);
  const hasDayVisual = Boolean(videoUrl || day.imageUrl);

  return (
    <li
      className={cn(
        "list-none",
        dayIndex > 0 &&
          "mt-10 border-t border-border/35 pt-10 sm:mt-11 sm:pt-11 lg:mt-12 lg:pt-12"
      )}
    >
      <article>
        {layout === 2 ? (
          <div className="space-y-8 sm:space-y-9 lg:space-y-10">
            {videoUrl ? (
              <EditorialVideo src={videoUrl} alt={imageAlt} />
            ) : day.imageUrl ? (
              <DayItineraryImage
                src={day.imageUrl}
                alt={imageAlt}
                variant={layout}
              />
            ) : null}
            <div className="mx-auto max-w-3xl">
              <ItineraryDayHeader day={day} />
              <ItineraryDayActivities day={day} activities={activities} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "grid items-center gap-7 sm:gap-8",
              hasDayVisual
                ? "lg:grid-cols-2 lg:gap-10 xl:gap-12"
                : "max-w-3xl"
            )}
          >
            <div
              className={cn(
                "min-w-0",
                layout === 1 && hasDayVisual && "lg:order-2"
              )}
            >
              <ItineraryDayHeader day={day} />
              <ItineraryDayActivities day={day} activities={activities} />
            </div>

            {hasDayVisual ? (
              <div
                className={cn("min-w-0", layout === 1 && "lg:order-1")}
              >
                {videoUrl ? (
                  <EditorialVideo src={videoUrl} alt={imageAlt} />
                ) : (
                  <DayItineraryImage
                    src={day.imageUrl}
                    alt={imageAlt}
                    variant={layout}
                  />
                )}
              </div>
            ) : null}
          </div>
        )}
      </article>
    </li>
  );
}
