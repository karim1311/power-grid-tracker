import type { Outage } from '../types';

export const WINDOW_HOURS = 3; // length of the "risky" window
export const CHARGE_HOURS = 3; // length of the recommended charging window
export const CHARGE_LEAD_HOURS = 1; // finish charging this long before the risky window
export const MIN_OUTAGES = 5; // fewer than this: don't guess
export const MIN_SHARE = 0.3; // risky window must hold at least 30% of outages
export const LOOKBACK_DAYS = 180; // older outages are ignored

export type Priority = 'High' | 'Medium' | 'Low';

export type Guidance =
  | { kind: 'not_enough_data'; count: number; needed: number }
  | { kind: 'no_pattern'; count: number }
  | {
      kind: 'pattern';
      priority: Priority;
      chargeWindow: string;
      nextWindow: string;
      basis: string;
    };

// ---- helpers ----

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Hour (0-23) and minute of an instant on the wall clock in `timeZone`. */
function localClock(ms: number, timeZone: string): { hour: number; minute: number } {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    });
    formatters.set(timeZone, f);
  }
  const parts = f.formatToParts(new Date(ms));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: get('hour') % 24, minute: get('minute') };
}

const mod24 = (n: number) => ((n % 24) + 24) % 24;
const hh = (h: number) => `${String(mod24(h)).padStart(2, '0')}:00`;
const range = (start: number, length: number) => `${hh(start)} - ${hh(start + length)}`;

// ---- public API ----

/** How many outages started in each local hour of the day, within the lookback period. */
export function startsByHour(
  outages: Pick<Outage, 'startedAt'>[],
  timeZone: string,
  nowMs = Date.now(),
): { hours: number[]; total: number } {
  const cutoff = nowMs - LOOKBACK_DAYS * 86_400_000;
  const hours: number[] = Array(24).fill(0);
  let total = 0;

  for (const o of outages) {
    const t = o.startedAt.getTime();
    if (t < cutoff || t > nowMs) continue;
    hours[localClock(t, timeZone).hour]++;
    total++;
  }
  return { hours, total };
}

/**
 * Looks for a time of day when this user's outages tend to start, and turns it
 * into charging advice. This is a pattern in past data, not a forecast.
 */
export function computeGuidance(
  outages: Pick<Outage, 'startedAt'>[],
  timeZone: string,
  nowMs = Date.now(),
): Guidance {
  const { hours, total } = startsByHour(outages, timeZone, nowMs);

  if (total < MIN_OUTAGES) {
    return { kind: 'not_enough_data', count: total, needed: MIN_OUTAGES };
  }

  // Slide the window around the clock (wrapping past midnight) and keep the busiest.
  let bestStart = 0;
  let bestCount = -1;
  for (let s = 0; s < 24; s++) {
    let c = 0;
    for (let i = 0; i < WINDOW_HOURS; i++) c += hours[(s + i) % 24];
    if (c > bestCount) {
      bestCount = c;
      bestStart = s;
    }
  }

  const share = bestCount / total;
  if (share < MIN_SHARE) return { kind: 'no_pattern', count: total };

  // Where are we relative to the risky window right now?
  const now = localClock(nowMs, timeZone);
  const nowH = now.hour + now.minute / 60;
  const inWindow = mod24(nowH - bestStart) < WINDOW_HOURS;
  const hoursUntil = inWindow ? 0 : mod24(bestStart - nowH);
  const dayLabel = bestStart > nowH ? 'Today' : 'Tomorrow';

  const priority: Priority =
    inWindow || hoursUntil <= 6 ? 'High' : hoursUntil <= 12 ? 'Medium' : 'Low';

  const chargeStart = bestStart - CHARGE_LEAD_HOURS - CHARGE_HOURS;
  const risky = range(bestStart, WINDOW_HOURS);

  return {
    kind: 'pattern',
    priority,
    chargeWindow: range(chargeStart, CHARGE_HOURS),
    nextWindow: inWindow
      ? `Now, until ${hh(bestStart + WINDOW_HOURS)}`
      : `${dayLabel}, ${risky}`,
    basis: `${Math.round(share * 100)}% of your ${total} outages in the last ${LOOKBACK_DAYS} days started between ${risky} (${timeZone}). That is a pattern in your history, not a forecast.`,
  };
}