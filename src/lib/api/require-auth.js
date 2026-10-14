import { auth } from "@/lib/auth";

/**
 * @param {Request} request
 * @returns {Promise<Response | { user: { id: string, name: string, email: string, image?: string | null } }>}
 */
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
