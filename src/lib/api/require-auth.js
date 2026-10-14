import { auth } from "@/lib/auth";

export async function requireAuthedUser(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;
  if (!user?.id) {
    return Response.json(
      {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Sign in to continue.",
      },
      { status: 401 },
    );
  }

  return { user };
}
