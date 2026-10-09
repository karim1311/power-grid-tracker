import { NextResponse } from "next/server";

export function databaseErrorResponse(
  operation: string,
  message: string,
  error: unknown
) {
  console.error(`${operation} failed:`, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
