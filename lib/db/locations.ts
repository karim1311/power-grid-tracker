import { Location, Result, ok, fail } from '../types';
import { MAX_LOCATION_NAME_LENGTH } from '../validation/user';
import { Queryable, isUuid } from './util';

const COLUMNS = 'id, user_id, name, utility_id, is_primary, created_at';

function mapRow(r: any): Location {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    utilityId: r.utility_id,
    isPrimary: r.is_primary,
    createdAt: new Date(r.created_at),
  };
}

/** Like the outage repo: `userId` first, every query scoped by it. */
export function createLocationRepo(db: Queryable) {
  return {
    async list(userId: string): Promise<Location[]> {
      if (!isUuid(userId)) return [];
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM locations WHERE user_id = $1::uuid ORDER BY is_primary DESC, created_at`,
        [userId],
      );
      return rows.map(mapRow);
    },

    async get(userId: string, locationId: string): Promise<Location | null> {
      if (!isUuid(userId) || !isUuid(locationId)) return null;
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM locations WHERE id = $1::uuid AND user_id = $2::uuid`,
        [locationId, userId],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    },

    async getPrimary(userId: string): Promise<Location | null> {
      if (!isUuid(userId)) return null;
      const { rows } = await db.query(
        `SELECT ${COLUMNS} FROM locations WHERE user_id = $1::uuid AND is_primary`,
        [userId],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    },

    /** Adds a non-primary location. (Changing which one is primary isn't built yet.) */
    async create(userId: string, input: { name?: unknown; utilityId?: unknown }): Promise<Result<Location>> {
      const errors: Record<string, string> = {};
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      if (name === '') errors.name = 'Name is required.';
      else if (name.length > MAX_LOCATION_NAME_LENGTH) {
        errors.name = `Name must be ${MAX_LOCATION_NAME_LENGTH} characters or fewer.`;
      }
      let utilityId: string | null = null;
      if (input.utilityId !== undefined && input.utilityId !== null) {
        if (typeof input.utilityId !== 'string') errors.utilityId = 'Utility ID must be text.';
        else utilityId = input.utilityId.trim() || null;
      }
      if (Object.keys(errors).length > 0) return fail('validation', errors);
      if (!isUuid(userId)) return fail('not_found');

      const { rows } = await db.query(
        `INSERT INTO locations (user_id, name, utility_id) VALUES ($1::uuid, $2::text, $3::text)
         RETURNING ${COLUMNS}`,
        [userId, name, utilityId],
      );
      return ok(mapRow(rows[0]));
    },
  };
}

export type LocationRepo = ReturnType<typeof createLocationRepo>;