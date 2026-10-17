import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon } from "@hugeicons/core-free-icons";

import { DESIGN } from "@/constants/design";

const FOOTER_LINKS = [
  { href: "/#explore", label: "Explore" },
  { href: "/destinations", label: "Destinations" },
  { href: "/trips", label: "Curated Trips" },
  { href: "/plan", label: "Plan" },
  { href: "/my-trips", label: "My Trips" },
  { href: "/#about", label: "About" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div
        className="mx-auto px-4 py-10 sm:px-6 lg:px-8"
        style={{ maxWidth: DESIGN.maxWidth }}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="min-w-0 max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <HugeiconsIcon
                icon={GlobeIcon}
                size={18}
                strokeWidth={1.5}
                className="text-primary"
              />
              <span className="text-[13px] font-medium tracking-[0.08em]">
                VoyaAI
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Thoughtful travel planning, made personal.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] font-normal tracking-[0.02em] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6">
          <p className="text-[12px] tracking-[0.02em] text-muted-foreground">
            © {year} VoyaAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
