/** "Oct 3, 2026 - 14:30" in the given IANA time zone. */
export function formatDateTime(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('month')} ${get('day')}, ${get('year')} - ${get('hour')}:${get('minute')}`;
}

/**
 * Turns a datetime-local string ("2026-10-09T14:30") into the real UTC instant,
 * interpreting it in the given IANA time zone. Returns null if unparseable.
 */
export function parseLocalDateTime(value: string, timeZone: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1, 6).map(Number);
  const s = m[6] ? Number(m[6]) : 0;

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  // Local-minus-UTC offset (ms) at a given instant.
  const offsetAt = (ms: number) => {
    const p: Record<string, number> = {};
    for (const part of fmt.formatToParts(new Date(ms))) {
      if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10);
    }
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
    return asUtc - Math.floor(ms / 1000) * 1000;
  };

  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const o1 = offsetAt(guess);
  let result = guess - o1;
  const o2 = offsetAt(result);
  if (o1 !== o2) result = guess - o2; // second pass for DST boundaries
  return new Date(result);
}