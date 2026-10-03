import { NextRequest, NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set(sessionOptions.cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: -1,
  });
  return response;
}
