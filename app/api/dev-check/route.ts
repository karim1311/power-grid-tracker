import { locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';

export async function GET() {
  const user = await getCurrentUser();
  const list = await locations.list(user.id);
  return Response.json({ user, locations: list });
}