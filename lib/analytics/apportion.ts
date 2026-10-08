import type { Interval } from '../types';

/** Downtime that falls on one local calendar day ('YYYY-MM-DD'). */
export interface DaySlice {
  day: string;
  ms: number;
}

// ---- time zone helpers (no external dependencies; uses Intl) ----

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function partsAt(ms: number, timeZone: string): Parts {
  const p: Parts = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (const part of getFormatter(timeZone).formatToParts(new Date(ms))) {
    if (part.type in p) (p as unknown as Record<string, number>)[part.type] = parseInt(part.value, 10);
  }
  p.hour = p.hour % 24;
  return p;
}

/** Offset (local minus UTC) in ms at a given instant. */
function offsetMs(ms: number, timeZone: string): number {
  const p = partsAt(ms, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** The UTC instant at which the given local date starts (00:00 local). */
function localMidnightUtc(year: number, month: number, day: number, timeZone: string): number {
  const guess = Date.UTC(year, month - 1, day);
  const o1 = offsetMs(guess, timeZone);
  const result = guess - o1;
  const o2 = offsetMs(result, timeZone);
  return o1 === o2 ? result : guess - o2; // second pass handles DST changes
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

function addDays(year: number, month: number, day: number, n: number): [number, number, number] {
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
}

// ---- public API ----

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Local calendar day ('YYYY-MM-DD') containing an instant. */
export function localDayOf(ms: number, timeZone: string): string {
  const p = partsAt(ms, timeZone);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

function parseDay(day: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) throw new RangeError(`Invalid day "${day}", expected YYYY-MM-DD`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** The UTC instant (epoch ms) at which a local day begins. */
export function startOfLocalDay(day: string, timeZone: string): number {
  const [y, m, d] = parseDay(day);
  return localMidnightUtc(y, m, d, timeZone);
}

/** Adds n calendar days to a 'YYYY-MM-DD' string. */
export function addDaysToDay(day: string, n: number): string {
  const [y, m, d] = parseDay(day);
  const [ny, nm, nd] = addDays(y, m, d, n);
  return `${pad(ny, 4)}-${pad(nm)}-${pad(nd)}`;
}

/** Every day from `from` to `to` inclusive. Capped at 366 days. */
export function listDays(from: string, to: string): string[] {
  if (from > to) throw new RangeError('"from" must not be after "to"');
  const days: string[] = [];
  for (let d = from; d <= to; d = addDaysToDay(d, 1)) {
    days.push(d);
    if (days.length > 366) throw new RangeError('Date range cannot exceed 366 days');
  }
  return days;
}

/** UTC instants covering local days from..to inclusive, as [start, end). */
export function dayRangeToInterval(from: string, to: string, timeZone: string): Interval {
  return {
    start: startOfLocalDay(from, timeZone),
    end: startOfLocalDay(addDaysToDay(to, 1), timeZone),
  };
}

/**
 * Splits an interval at local midnights in the user's time zone, returning the
 * downtime that falls on each calendar day. DST days (23h/25h) are handled.
 */
export function splitByDay(interval: Interval, timeZone: string): DaySlice[] {
  const slices: DaySlice[] = [];
  let cursor = interval.start;

  while (cursor < interval.end) {
    const p = partsAt(cursor, timeZone);
    const [ny, nm, nd] = addDays(p.year, p.month, p.day, 1);
    let nextMidnight = localMidnightUtc(ny, nm, nd, timeZone);
    if (nextMidnight <= cursor) nextMidnight = cursor + 1; // safety: always progress
    const sliceEnd = Math.min(interval.end, nextMidnight);

    slices.push({
      day: `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`,
      ms: sliceEnd - cursor,
    });
    cursor = sliceEnd;
  }
  return slices;
}