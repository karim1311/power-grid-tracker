import { Result, User, ok, fail } from '../types';
import { normalizeEmail } from '../validation/user';
import { Queryable, isUuid } from './util';

export interface NewUser {
  email: string;
  /** Already hashed (bcrypt/argon2). This layer never sees plaintext passwords. */
  passwordHash: string;
  timeZone: string;
  locationName: string;
}

const USER_COLUMNS = 'id, email, time_zone, created_at';

function mapUser(r: any): User {
  return { id: r.id, email: r.email, timeZone: r.time_zone, createdAt: new Date(r.created_at) };
}

export function createUserRepo(db: Queryable) {
  return {
    /**
     * Creates the user AND their primary location in one SQL statement, so you
     * can never end up with a user who has no location (which would make
     * outage creation impossible). Returns 'conflict' if the email is taken.
     */
    async createWithDefaultLocation(input: NewUser): Promise<Result<User>> {
      const { rows } = await db.query(
        `WITH new_user AS (
           INSERT INTO users (email, password_hash, time_zone)
           VALUES ($1::text, $2::text, $3::text)
           ON CONFLICT (email) DO NOTHING
           RETURNING ${USER_COLUMNS}
         ), new_location AS (
           INSERT INTO locations (user_id, name, is_primary)
           SELECT id, $4::text, true FROM new_user
         )
         SELECT ${USER_COLUMNS} FROM new_user`,
        [normalizeEmail(input.email), input.passwordHash, input.timeZone, input.locationName],
      );
      // No row = email already registered (ON CONFLICT skipped the insert).
      return rows[0] ? ok(mapUser(rows[0])) : fail('conflict', { email: 'Unable to create an account with these details.' });
    },

    async getById(userId: string): Promise<User | null> {
      if (!isUuid(userId)) return null;
      const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1::uuid`, [userId]);
      return rows[0] ? mapUser(rows[0]) : null;
    },

    /**
     * For login only: returns the user plus their password hash so the caller
     * can verify it. Keep the hash inside the login route; never send it to a client.
     */
    async findCredentialsByEmail(email: string): Promise<{ user: User; passwordHash: string } | null> {
      const { rows } = await db.query(
        `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = $1::text`,
        [normalizeEmail(email)],
      );
      return rows[0] ? { user: mapUser(rows[0]), passwordHash: rows[0].password_hash } : null;
    },
  };
}

export type UserRepo = ReturnType<typeof createUserRepo>;