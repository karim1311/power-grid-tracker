export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "change-me-in-production-use-a-long-random-string",
  cookieName: "gridlog_session",
  ttl: 60 * 60 * 24 * 7,
};

export async function getSession(): Promise<SessionData | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionOptions.cookieName);
  if (!sessionCookie?.value) return null;

  try {
    const payload = Buffer.from(sessionCookie.value, "base64url").toString("utf-8");
    return JSON.parse(payload) as SessionData;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.userId) {
    return { error: { status: 401 as const, message: "Unauthorized" }, session: null as null };
  }
  return { error: null, session };
}
