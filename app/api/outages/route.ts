import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { outages, locations, users } from '@/lib/db/client';
import { formatDateTime } from '@/lib/format';
import { outageStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  // Check the session ourselves so logged-out callers get JSON, not a redirect to /login.
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await users.getById(userId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('query') ?? '').trim().slice(0, 100);
  const requestedPage = Math.floor(Number(searchParams.get('page'))) || 1;

  const total = await outages.count(user.id, { search });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  const [outageList, locationList] = await Promise.all([
    outages.list(user.id, {
      search,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    locations.list(user.id),
  ]);

  const locationNames = new Map(locationList.map((l) => [l.id, l.name]));

  const items = outageList.map((outage) => ({
    id: outage.id,
    locationName: locationNames.get(outage.locationId) ?? 'Unknown location',
    startTime: formatDateTime(outage.startedAt, user.timeZone),
    endTime: outage.endedAt
      ? formatDateTime(outage.endedAt, user.timeZone)
      : undefined,
    status: outageStatus(outage) === 'ongoing' ? 'active' : 'resolved',
  }));

  return NextResponse.json({ items, page, totalPages, total });
}