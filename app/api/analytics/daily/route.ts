import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
