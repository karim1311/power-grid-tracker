import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    });

    const timezone = user?.timezone ?? "UTC";

    const summaries = await prisma.dailySummary.findMany({
      where: { userId: session.userId, timezone },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ summaries }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse(
      "Get daily summaries",
      "Failed to load daily summaries",
      error
    );
  }
}
