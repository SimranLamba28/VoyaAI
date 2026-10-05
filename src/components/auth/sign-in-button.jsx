"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 rounded-full border-foreground/15 bg-transparent px-5 text-[13px] font-normal tracking-[0.02em] hover:border-foreground/35 hover:bg-transparent hover:text-foreground"
      onClick={() => authClient.signIn.social({ provider: "google" })}
    >
      Sign In
    </Button>
  );
}
