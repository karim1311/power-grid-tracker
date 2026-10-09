import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outages = await prisma.outage.findMany({
      where: { userId: session.userId },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        status: true,
        note: true,
        locationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ outages }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse("List outages", "Failed to load outages", error);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { startTime, endTime, note, locationId } = body;

    if (!startTime) {
      return NextResponse.json(
        { error: "Start time is required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid start time" },
        { status: 400 }
      );
    }

    let end: Date | undefined;
    if (endTime) {
      end = new Date(endTime);
      if (isNaN(end.getTime())) {
        return NextResponse.json(
          { error: "Invalid end time" },
          { status: 400 }
        );
      }
      if (end < start) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }
    }

    const duration = end ? Math.round((end.getTime() - start.getTime()) / 1000) : 0;
    const status = end ? "COMPLETED" : "ONGOING";

    const outage = await prisma.outage.create({
      data: {
        userId: session.userId,
        startTime: start,
        endTime: end,
        duration,
        status,
        note: note ?? null,
        locationId: locationId ?? null,
      },
    });

    if (outage.status === "COMPLETED") {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { timezone: true },
      });
      if (user) {
        const { recalculateDailySummaries } = await import("@/lib/outages/daily");
        await recalculateDailySummaries(session.userId, user.timezone);
      }
    }

    return NextResponse.json({ outage }, { status: 201 });
  } catch (error) {
    return databaseErrorResponse("Create outage", "Failed to create outage", error);
  }
}
