"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  GlobeIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";

import { NavbarAuth } from "@/components/auth/navbar-auth";
import { Button } from "@/components/ui/button";
import { DESIGN } from "@/constants/design";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/trips", label: "Curated trips" },
  { href: "/plan", label: "Plan" },
  { href: "/my-trips", label: "My Trips" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto grid h-14 w-full grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[1fr_auto_1fr] md:px-6 lg:px-8"
        style={{ maxWidth: DESIGN.maxWidth }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          onClick={() => setOpen(false)}
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

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
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

        <div className="flex items-center justify-self-end gap-2">
          <NavbarAuth />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <HugeiconsIcon
              icon={open ? Cancel01Icon : Menu01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </Button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        hidden={!open}
        className="border-t border-border/40 md:hidden"
      >
        <ul
          className="mx-auto flex w-full flex-col gap-1 px-4 py-3 md:px-6 lg:px-8"
          style={{ maxWidth: DESIGN.maxWidth }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-[12px] px-2 py-2 text-[13px] tracking-[0.02em] text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
