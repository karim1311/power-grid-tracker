import { prisma } from "@/lib/prisma";

export async function recalculateDailySummaries(userId: string, timezone: string) {
  const completedOutages = await prisma.outage.findMany({
    where: { userId, status: "COMPLETED" },
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
  });

  const dayMap = new Map<string, { totalDowntime: number; outageCount: number }>();

  for (const outage of completedOutages) {
    if (!outage.endTime) continue;

    let current = new Date(outage.startTime);
    const end = new Date(outage.endTime);

    while (current < end) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const segmentStart = current > dayStart ? current : dayStart;
      const segmentEnd = end < dayEnd ? end : dayEnd;

      const downtimeMs = segmentEnd.getTime() - segmentStart.getTime();
      const downtimeMinutes = Math.max(0, Math.round(downtimeMs / 60000));

      if (downtimeMinutes > 0) {
        const key = dayStart.toISOString();
        const existing = dayMap.get(key) ?? { totalDowntime: 0, outageCount: 0 };
        existing.totalDowntime += downtimeMinutes;
        existing.outageCount += 1;
        dayMap.set(key, existing);
      }

      current = dayEnd;
    }
  }

  for (const [dateKey, data] of dayMap) {
    const date = new Date(dateKey);
    const avgDowntime = data.outageCount > 0 ? data.totalDowntime / data.outageCount : 0;

    await prisma.dailySummary.upsert({
      where: {
        userId_date_timezone: {
          userId,
          date,
          timezone,
        },
      },
      update: {
        totalDowntime: data.totalDowntime,
        outageCount: data.outageCount,
        averageDowntime: avgDowntime,
        updatedAt: new Date(),
      },
      create: {
        userId,
        date,
        timezone,
        totalDowntime: data.totalDowntime,
        outageCount: data.outageCount,
        averageDowntime: avgDowntime,
      },
    });
  }

  const staleDates = Array.from(dayMap.keys());
  if (staleDates.length > 0) {
    await prisma.dailySummary.deleteMany({
      where: {
        userId,
        date: { notIn: staleDates.map((d) => new Date(d)) },
      },
    });
  } else {
    await prisma.dailySummary.deleteMany({
      where: { userId },
    });
  }
}
