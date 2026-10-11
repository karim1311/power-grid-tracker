/** Shared types for GridLog. Instants are always absolute (UTC) moments. */

export interface Outage {
  id: string;
  userId: string;
  locationId: string;
  startedAt: Date;
  endedAt: Date | null; // null = ongoing
  note: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  timeZone: string; // IANA name, e.g. 'America/Denver'
  createdAt: Date;
}

export interface Location {
  id: string;
  userId: string;
  name: string; // "My Home", "My Office"
  utilityId: string | null;
  isPrimary: boolean;
  createdAt: Date;
}

export type OutageStatus = 'ongoing' | 'completed';

/** A half-open time range [start, end) in epoch milliseconds. */
export interface Interval {
  start: number;
  end: number;
}

export type ErrorCode = 'validation' | 'not_found' | 'conflict';

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; code: ErrorCode; fields?: Record<string, string> };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = (
  code: ErrorCode,
  fields?: Record<string, string>,
): { ok: false; code: ErrorCode; fields?: Record<string, string> } => ({ ok: false, code, fields });

/** Status is derived, never stored, so it can't drift out of sync. */
export function outageStatus(o: Pick<Outage, 'endedAt'>): OutageStatus {
  return o.endedAt === null ? 'ongoing' : 'completed';
}

/** Duration in ms, or null while the outage is ongoing. */
export function outageDurationMs(o: Pick<Outage, 'startedAt' | 'endedAt'>): number | null {
  return o.endedAt === null ? null : o.endedAt.getTime() - o.startedAt.getTime();
}