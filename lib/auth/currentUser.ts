import { users } from '@/lib/db/client';
import type { User } from '@/lib/types';

/**
 * TEMPORARY: always returns the seeded dev user from DEV_USER_ID.
 * Replace the body with real session lookup once login exists.
 * Server code only (pages, server components, Server Actions).
 */
export async function getCurrentUser(): Promise<User> {
  const id = process.env.DEV_USER_ID;
  if (!id) throw new Error('DEV_USER_ID is not set in .env.local.');

  const user = await users.getById(id);
  if (!user) throw new Error('DEV_USER_ID does not match any user in the database.');
  return user;
}