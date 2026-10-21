import { DESIGN } from "@/constants/design";
import { cn } from "@/lib/utils";

function Bone({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

function CatalogPageHeaderSkeleton() {
  return (
    <header className="mb-10 sm:mb-12 lg:mb-14">
      <Bone className="h-3 w-14 sm:w-16" />
      <Bone className="mt-3 h-9 w-52 sm:h-10 sm:w-64" />
      <Bone className="mt-4 h-4 w-full max-w-lg" />
      <Bone className="mt-2 h-4 w-full max-w-md" />
    </header>
  );
}

function catalogMainClassName() {
  return "px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16";
}

export function DestinationsRouteLoading() {
  return (
    <main className={catalogMainClassName()} role="status" aria-label="Loading destinations">
      <div className="mx-auto max-w-6xl">
        <CatalogPageHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Bone
              key={index}
              className="aspect-[5/6] w-full rounded-[20px]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function TripListCardSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] border border-border/40 bg-background shadow-sm"
      aria-hidden="true"
    >
      <Bone className="absolute inset-y-0 left-0 w-[42%] rounded-none sm:w-[40%] lg:w-[34%]" />
      <div className="flex min-h-[7.5rem] flex-col py-3.5 pl-[44%] pr-3.5 sm:min-h-[8rem] sm:pl-[41%] sm:py-4 sm:pr-5 lg:pl-[36%]">
        <Bone className="h-4 w-[85%] sm:h-5" />
        <Bone className="mt-2 h-3.5 w-1/2" />
        <Bone className="mt-3 h-3 w-2/3" />
        <Bone className="mt-3 h-3.5 w-20" />
      </div>
    </div>
  );
}

export function TripsRouteLoading() {
  return (
    <main className={catalogMainClassName()} role="status" aria-label="Loading curated trips">
      <div className="mx-auto max-w-6xl">
        <CatalogPageHeaderSkeleton />
        <Bone className="mb-8 h-10 w-full max-w-xl rounded-[12px] sm:mb-10" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <TripListCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function MyTripsRouteLoading() {
  return (
    <main className={catalogMainClassName()} role="status" aria-label="Loading your trips">
      <div className="mx-auto max-w-6xl">
        <CatalogPageHeaderSkeleton />
        <div className="flex flex-col gap-4 sm:gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <TripListCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function TripDetailRouteLoading() {
  return (
    <main
      className="pb-14 sm:pb-16 lg:pb-20"
      role="status"
      aria-label="Loading trip"
    >
      <section className="px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
        <Bone
          className="mx-auto min-h-[26rem] w-full sm:min-h-[30rem] lg:min-h-[36rem]"
          style={{
            maxWidth: DESIGN.maxWidth,
            borderRadius: DESIGN.cardRadius,
          }}
        />
      </section>
      <div className="mx-auto mt-8 w-full max-w-7xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <Bone className="h-3 w-16" />
        <Bone className="mt-3 h-8 w-full max-w-md sm:h-9" />
        <Bone className="mt-4 h-4 w-full max-w-2xl" />
        <Bone className="mt-2 h-4 w-full max-w-xl" />
      </div>
      <div className="mx-auto mt-10 w-full max-w-7xl space-y-8 px-4 sm:mt-12 sm:px-6 lg:px-8">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Bone className="h-6 w-40" />
            <Bone className="h-48 w-full rounded-[18px] sm:h-56" />
            <Bone className="h-4 w-full max-w-3xl" />
            <Bone className="h-4 w-full max-w-2xl" />
          </div>
        ))}
      </div>
    </main>
  );
}
