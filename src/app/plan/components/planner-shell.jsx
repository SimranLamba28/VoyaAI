import Link from "next/link";

export function PlannerShell({ backHref, backLabel, children }) {
  return (
    <main className="pb-14 sm:pb-16 lg:pb-20">
      <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-sm text-muted-foreground">
            <Link
              href={backHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {backLabel}
            </Link>
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}
