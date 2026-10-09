import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";
import { createUser } from "@/lib/auth";

function setSessionCookie(
  sessionData: { userId: string; email: string; name?: string },
  response: NextResponse
) {
  const payload = JSON.stringify(sessionData);
  const encoded = Buffer.from(payload).toString("base64url");
  response.cookies.set(sessionOptions.cookieName, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionOptions.ttl,
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, timezone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await createUser({ email, password, name, timezone });

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    };

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          timezone: user.timezone,
        },
      },
      { status: 201 }
    );

    return setSessionCookie(sessionData, response);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
