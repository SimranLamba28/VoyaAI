"use client";

import { authClient } from "@/lib/auth-client";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserProfileMenu } from "@/components/auth/user-profile-menu";

export function NavbarAuth() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  if (session?.user) {
    return <UserProfileMenu user={session.user} />;
  }

  return <SignInButton />;
}
