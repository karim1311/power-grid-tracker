import type { Outage } from '../types';
import { computeDailySummaries } from './daily';
import { dayRangeToInterval, localDayOf } from './apportion';

export type CompareMode = 'last-month' | 'last-year' | 'all-time';

export interface WindowStats {
  count: number; // fractional for the all-time average
  totalMs: number;
  elapsedMs: number; // time covered by the window, so far
}

export interface Comparison {
  current: WindowStats;
  baseline: WindowStats | null; // null = nothing to compare against
  throughDay: number;
}

type Completed = Pick<Outage, 'startedAt' | 'endedAt'>[];

const pad = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM' plus delta months. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

function daysIn(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function statsForWindow(
  outages: Completed,
  fromDay: string,
  toDay: string,
  tz: string,
  nowMs: number,
): WindowStats {
  const iv = dayRangeToInterval(fromDay, toDay, tz);
  let count = 0;
  for (const o of outages) {
    if (!o.endedAt) continue;
    const s = o.startedAt.getTime();
    const e = o.endedAt.getTime();
    if (e > s && s < iv.end && e > iv.start) count++;
  }
  const totalMs = computeDailySummaries(outages, fromDay, toDay, tz).reduce(
    (sum, d) => sum + d.totalDowntimeMs,
    0,
  );
  const elapsedMs = Math.max(Math.min(iv.end, nowMs) - iv.start, 0);
  return { count, totalMs, elapsedMs };
}

/** Days 1..throughDay of a month (clamped for shorter months). */
function monthToDate(outages: Completed, month: string, throughDay: number, tz: string, nowMs: number) {
  const last = Math.min(throughDay, daysIn(month));
  return statsForWindow(outages, `${month}-01`, `${month}-${pad(last)}`, tz, nowMs);
}

export function compareMonthToDate(
  outages: Completed,
  mode: CompareMode,
  tz: string,
  nowMs = Date.now(),
): Comparison {
  const today = localDayOf(nowMs, tz); // 'YYYY-MM-DD'
  const thisMonth = today.slice(0, 7);
  const throughDay = Number(today.slice(8, 10));
  const current = monthToDate(outages, thisMonth, throughDay, tz, nowMs);

  let baseline: WindowStats | null = null;

  if (mode === 'last-month') {
    baseline = monthToDate(outages, shiftMonth(thisMonth, -1), throughDay, tz, nowMs);
  } else if (mode === 'last-year') {
    baseline = monthToDate(outages, shiftMonth(thisMonth, -12), throughDay, tz, nowMs);
  } else {
    // Average the same window across every earlier month, starting at the first logged outage.
    const starts = outages.map((o) => o.startedAt.getTime());
    if (starts.length > 0) {
      const first = localDayOf(Math.min(...starts), tz).slice(0, 7);
      const months: WindowStats[] = [];
      for (let m = first; m < thisMonth; m = shiftMonth(m, 1)) {
        months.push(monthToDate(outages, m, throughDay, tz, nowMs));
      }
      if (months.length > 0) {
        const n = months.length;
        baseline = {
          count: months.reduce((s, x) => s + x.count, 0) / n,
          totalMs: months.reduce((s, x) => s + x.totalMs, 0) / n,
          elapsedMs: months.reduce((s, x) => s + x.elapsedMs, 0) / n,
        };
      }
    }
  }

  return { current, baseline, throughDay };
}