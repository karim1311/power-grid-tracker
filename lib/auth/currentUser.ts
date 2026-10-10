import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { users } from '@/lib/db/client';
import type { User } from '@/lib/types';

/**
 * Returns the authenticated user from the current session.
 * Redirects to login if the session is missing or the user does not exist.
 * Server code only (pages, server components, Server Actions).
 */
export async function getCurrentUser(): Promise<User> {
  const session = await auth();
  const id = session?.user?.id;

  if (!id) {
    redirect('/login')
  }

  const user = await users.getById(id);

  if (!user) {
    redirect('/login')
  }

  return user;
}