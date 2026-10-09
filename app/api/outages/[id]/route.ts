import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { databaseErrorResponse } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let outage;
  try {
    outage = await prisma.outage.findFirst({
      where: { id, userId: session.userId },
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
  } catch (error) {
    return databaseErrorResponse("Get outage", "Failed to load outage", error);
  }

  if (!outage) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ outage }, { status: 200 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: outageId } = await params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let existing;
  try {
    existing = await prisma.outage.findUnique({
      where: { id: outageId },
      select: { id: true, userId: true, startTime: true, endTime: true },
    });
  } catch (error) {
    return databaseErrorResponse("Update outage", "Failed to update outage", error);
  }

  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { startTime, endTime, note, locationId } = body;

    const updateData: Record<string, unknown> = {};

    if (startTime !== undefined) {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return NextResponse.json(
          { error: "Invalid start time" },
          { status: 400 }
        );
      }
      updateData.startTime = start;
    }

    let end: Date | undefined;
    if (endTime !== undefined) {
      if (endTime === null) {
        end = undefined;
      } else {
        end = new Date(endTime);
        if (isNaN(end.getTime())) {
          return NextResponse.json(
            { error: "Invalid end time" },
            { status: 400 }
          );
        }
      }
    }

      const effectiveStart = updateData.startTime
        ? new Date(updateData.startTime as Date)
      : existing.startTime;

    if (end !== undefined && end < effectiveStart) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    if (end !== undefined) {
      updateData.endTime = end;
      updateData.duration = Math.round((end.getTime() - effectiveStart.getTime()) / 1000);
      updateData.status = "COMPLETED";
    } else if (endTime === null) {
      updateData.endTime = null;
      updateData.duration = 0;
      updateData.status = "ONGOING";
    }

    if (note !== undefined) updateData.note = note;
    if (locationId !== undefined) updateData.locationId = locationId;

    const updated = await prisma.outage.update({
      where: { id: outageId },
      data: updateData,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    });

    if (user) {
      const { recalculateDailySummaries } = await import("@/lib/outages/daily");
      await recalculateDailySummaries(session.userId, user.timezone);
    }

    return NextResponse.json({ outage: updated }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse("Update outage", "Failed to update outage", error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: outageId } = await params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let existing;
  try {
    existing = await prisma.outage.findUnique({
      where: { id: outageId },
      select: { id: true, userId: true },
    });
  } catch (error) {
    return databaseErrorResponse("Delete outage", "Failed to delete outage", error);
  }

  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.outage.delete({
      where: { id: outageId },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { timezone: true },
    });

    if (user) {
      const { recalculateDailySummaries } = await import("@/lib/outages/daily");
      await recalculateDailySummaries(session.userId, user.timezone);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return databaseErrorResponse("Delete outage", "Failed to delete outage", error);
  }
}
