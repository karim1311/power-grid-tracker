/**
 * Minimal database interface. Satisfied by `pg`'s Pool/Client and by the Pool
 * from `@neondatabase/serverless`, so the repos don't care which one you pick.
 */
export interface Queryable {
  query(text: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres throws on malformed UUIDs; checking first lets us return not_found instead. */
export const isUuid = (s: unknown): s is string => typeof s === 'string' && UUID_RE.test(s);