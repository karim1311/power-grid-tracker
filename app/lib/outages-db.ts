import { Outage, Result, ok, fail } from './types';
import { Queryable, isUuid } from './util';
import {
  OutageInput,
  ValidOutage,
  validateOutage,
  validateOutageUpdate,
} from '../validation/outage';
import { neon } from '@neondatabase/serverless';

export type { Queryable };

export interface ListFilters {
  locationId?: string;
  /** Outages overlapping [from, to). */
  from?: Date;
  to?: Date;
  status?: 'ongoing' | 'completed' | 'all';
  limit?: number; // default 100, max 500
  offset?: number;
}

const COLUMNS = 'id, user_id, location_id, started_at, ended_at, note, created_at';

function mapRow(r: any): Outage {
  return {
    id: r.id,
    userId: r.user_id,
    locationId: r.location_id,
    startedAt: new Date(r.started_at),
    endedAt: r.ended_at === null ? null : new Date(r.ended_at),
    note: r.note,
    createdAt: new Date(r.created_at),
  };
}

/**
 * Data-access layer. Every method takes `userId` first and scopes every query
 * by it, so one user can never read or change another user's records.
 * "Not yours" and "doesn't exist" both return not_found, so existence is never revealed.
 */
export function createOutageRepo(db: Queryable) {
  async function get(userId: string, outageId: string): Promise<Outage | null> {
    if (!isUuid(userId) || !isUuid(outageId)) return null;
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM outages WHERE id = $1::uuid AND user_id = $2::uuid`,
      [outageId, userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  return {
    async create(userId: string, input: OutageInput, now = new Date()): Promise<Result<Outage>> {
      const v = validateOutage(input, now);
      if (!v.ok) return v;
      const { locationId, startedAt, endedAt, note } = v.value;
      if (!isUuid(userId) || !isUuid(locationId)) return fail('not_found');

      // The EXISTS check means a location you don't own behaves like one that doesn't exist.
      const { rows } = await db.query(
        `INSERT INTO outages (user_id, location_id, started_at, ended_at, note)
         SELECT $1::uuid, $2::uuid, $3::timestamptz, $4::timestamptz, $5::text
         WHERE EXISTS (SELECT 1 FROM locations WHERE id = $2::uuid AND user_id = $1::uuid)
         RETURNING ${COLUMNS}`,
        [userId, locationId, startedAt, endedAt, note],
      );
      return rows[0] ? ok(mapRow(rows[0])) : fail('not_found');
    },

    get(userId: string, outageId: string): Promise<Outage | null> {
      return get(userId, outageId);
    },

    async list(userId: string, filters: ListFilters = {}): Promise<Outage[]> {
      if (!isUuid(userId)) return [];
      const where: string[] = ['user_id = $1::uuid'];
      const params: unknown[] = [userId];
      const add = (sql: string, value: unknown) => {
        params.push(value);
        where.push(sql.replace('?', `$${params.length}`));
      };

      if (filters.locationId) {
        if (!isUuid(filters.locationId)) return [];
        add('location_id = ?::uuid', filters.locationId);
      }
      if (filters.from) add('(ended_at IS NULL OR ended_at > ?::timestamptz)', filters.from);
      if (filters.to) add('started_at < ?::timestamptz', filters.to);
      if (filters.status === 'ongoing') where.push('ended_at IS NULL');
      if (filters.status === 'completed') where.push('ended_at IS NOT NULL');

      const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
      const offset = Math.max(filters.offset ?? 0, 0);
      params.push(limit, offset);

      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM outages
         WHERE ${where.join(' AND ')}
         ORDER BY started_at DESC
         LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      );
      return rows.map(mapRow);
    },

    async update(
      userId: string,
      outageId: string,
      patch: OutageInput,
      now = new Date(),
    ): Promise<Result<Outage>> {
      const existing = await get(userId, outageId);
      if (!existing) return fail('not_found');

      const v: Result<ValidOutage> = validateOutageUpdate(existing, patch, now);
      if (!v.ok) return v; // original record untouched
      const { locationId, startedAt, endedAt, note } = v.value;
      if (!isUuid(locationId)) return fail('validation', { locationId: 'Choose a valid location.' });

      const { rows } = await db.query(
        `UPDATE outages
         SET location_id = $3::uuid, started_at = $4::timestamptz,
             ended_at = $5::timestamptz, note = $6::text
         WHERE id = $1::uuid AND user_id = $2::uuid
           AND EXISTS (SELECT 1 FROM locations WHERE id = $3::uuid AND user_id = $2::uuid)
         RETURNING ${COLUMNS}`,
        [outageId, userId, locationId, startedAt, endedAt, note],
      );
      // The outage exists (we just loaded it), so no row means the new location isn't theirs.
      return rows[0] ? ok(mapRow(rows[0])) : fail('validation', { locationId: 'Choose a valid location.' });
    },

    /** Returns true if a record was deleted, false if none matched. */
    async delete(userId: string, outageId: string): Promise<boolean> {
      if (!isUuid(userId) || !isUuid(outageId)) return false;
      const { rows } = await db.query(
        `DELETE FROM outages WHERE id = $1::uuid AND user_id = $2::uuid RETURNING id`,
        [outageId, userId],
      );
      return rows.length > 0;
    },

    /**
     * Same-location outages whose time window overlaps the given one. Use before
     * saving to show a "possible duplicate" warning (a warning, not a block).
     */
    async findPossibleDuplicates(
      userId: string,
      locationId: string,
      startedAt: Date,
      endedAt: Date | null,
      excludeOutageId?: string,
    ): Promise<Outage[]> {
      if (!isUuid(userId) || !isUuid(locationId)) return [];
      const params: unknown[] = [userId, locationId, startedAt, endedAt];
      let exclude = '';
      if (excludeOutageId && isUuid(excludeOutageId)) {
        params.push(excludeOutageId);
        exclude = 'AND id <> $5::uuid';
      }
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM outages
         WHERE user_id = $1::uuid AND location_id = $2::uuid
           AND started_at < COALESCE($4::timestamptz, 'infinity'::timestamptz)
           AND (ended_at IS NULL OR ended_at > $3::timestamptz)
           ${exclude}
         ORDER BY started_at DESC`,
        params,
      );
      return rows.map(mapRow);
    },
  };
}

export type OutageRepo = ReturnType<typeof createOutageRepo>;


// karim 
const sql = neon(process.env.DATABASE_URL!);

export async function getOutages(
  // userId?: string | null
): Promise<Outage[]> {
    // if (userId) {
    //     const { rows } = await sql<Outage>`
    //     SELECT * FROM outages ORDER BY id
    //     `;
    //     return rows
    // }
    const rows = await sql`
       SELECT 
          id
          user_id AS "userId",
          location_id AS "locationId",
          started_at AS "startedAt",
          ended_at AS "endedAt",
          note,
          created_at AS "createdAt"

       FROM outages 
       ORDER BY id
      `;
    return rows as Outage[];
}




const ITEMS_PER_PAGE = 5;

export async function getFilteredOutages(
    query: string = '',
    currentPage: number = 1
): Promise<Outage[]> {
    const searchTerm = `%${query}%`;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const rows = await sql`
        SELECT
            id,
            user_id                     AS "userId",
            location_id                 AS "locationId",
            started_at                  AS "startedAt",
            ended_at                    AS "endedAt",
            note,              
        FROM outages
        WHERE
            presiding ILIKE ${searchTerm}
            OR conducting ILIKE ${searchTerm}
            OR meeting_type ILIKE ${searchTerm}
            OR speakers::text ILIKE ${searchTerm}
        ORDER BY date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    return rows as unknown as Outage[];
}

export async function getOutagesTotalPages(
    query: string = ''
): Promise<number> {
    const searchTerm = `%${query}%`;
    const rows = await sql`
    SELECT COUNT(*) FROM outages
    WHERE
        presiding   ILIKE ${searchTerm}
        OR conducting ILIKE ${searchTerm}
        OR meeting_type ILIKE ${searchTerm}
        OR speakers::text ILIKE ${searchTerm}
    `;
    return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
}

export async function getOutageById(
    id: number
): Promise<Outage | null> {
    const rows = await sql`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD') AS "date",
      meeting_type                AS "meetingType",
      presiding, conducting, announcements,
      opening_hymn                AS "openingHymn",
      opening_prayer              AS "openingPrayer",
      ward_business               AS "wardBusiness",
      stake_business              AS "stakeBusiness",
      sacrament_hymn              AS "sacramentHymn",
      speakers,
      closing_hymn                AS "closingHymn",
      closing_prayer              AS "closingPrayer"
    FROM meetings WHERE id = ${id}
    `;

    return rows[0] as unknown as Outage ?? null;
}