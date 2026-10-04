import type { Interval, Outage } from '../types';
import { mergeIntervals } from './overlap';
import { listDays, splitByDay } from './apportion';

export interface DailySummary {
  day: string; // 'YYYY-MM-DD' in `timeZone`
  /** 'no_data' means no completed outages: NOT a claim of zero downtime. */
  status: 'ok' | 'no_data';
  outageCount: number;
  totalDowntimeMs: number;
  averageDowntimeMs: number | null;
  timeZone: string;
}

/**
 * Daily reliability summaries for local days fromDay..toDay (inclusive).
 *
 * - Only completed outages are used (ongoing ones are excluded).
 * - Outages crossing midnight contribute to every day they touch.
 * - Overlapping outages are merged first, so no minute is counted twice.
 * - outageCount counts distinct outages touching the day (a midnight-crossing
 *   outage counts once on each day); average = total downtime / outageCount.
 */
export function computeDailySummaries(
  outages: Pick<Outage, 'startedAt' | 'endedAt'>[],
  fromDay: string,
  toDay: string,
  timeZone: string,
): DailySummary[] {
  const intervals: Interval[] = [];
  for (const o of outages) {
    if (o.endedAt === null) continue;
    const start = o.startedAt.getTime();
    const end = o.endedAt.getTime();
    if (end > start) intervals.push({ start, end });
  }

  const counts = new Map<string, number>();
  for (const iv of intervals) {
    for (const slice of splitByDay(iv, timeZone)) {
      counts.set(slice.day, (counts.get(slice.day) ?? 0) + 1);
    }
  }

  const totals = new Map<string, number>();
  for (const iv of mergeIntervals(intervals)) {
    for (const slice of splitByDay(iv, timeZone)) {
      totals.set(slice.day, (totals.get(slice.day) ?? 0) + slice.ms);
    }
  }

  return listDays(fromDay, toDay).map((day) => {
    const outageCount = counts.get(day) ?? 0;
    if (outageCount === 0) {
      return {
        day,
        status: 'no_data' as const,
        outageCount: 0,
        totalDowntimeMs: 0,
        averageDowntimeMs: null,
        timeZone,
      };
    }
    const totalDowntimeMs = totals.get(day) ?? 0;
    return {
      day,
      status: 'ok' as const,
      outageCount,
      totalDowntimeMs,
      averageDowntimeMs: totalDowntimeMs / outageCount,
      timeZone,
    };
  });
}

/** Plain-language duration, e.g. "2 h 15 min". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 1) return 'less than 1 min';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}