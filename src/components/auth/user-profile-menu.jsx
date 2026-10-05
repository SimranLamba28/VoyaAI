"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserProfileMenu({ user }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full p-0 hover:bg-muted"
          aria-label="Open profile menu"
        >
          <Avatar size="sm" className="size-7 after:border-foreground/10">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name}
            />
            <AvatarFallback className="text-[11px] font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 max-w-[90vw] rounded-xl border border-border/50 bg-background p-4 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-9 after:border-foreground/10">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name}
            />
            <AvatarFallback className="text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium tracking-[0.02em] text-foreground">
              {user.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="my-3 h-px bg-border/50" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full rounded-full border-foreground/15 bg-transparent px-5 text-[13px] font-normal tracking-[0.02em] hover:border-foreground/35 hover:bg-transparent hover:text-foreground"
          onClick={() => authClient.signOut()}
        >
          Sign Out
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}