
import { NextResponse } from 'next/server';
import { outages, locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { formatDateTime } from '@/lib/format';
import { outageStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();

  const [outageList, locationList] = await Promise.all([
    outages.list(user.id),
    locations.list(user.id),
  ]);

  const locationNames = new Map(
    locationList.map((location) => [location.id, location.name])
  );

  const data = outageList.map((outage) => ({
    id: outage.id,
    locationName:
      locationNames.get(outage.locationId) ?? 'Unknown location',
    startTime: formatDateTime(outage.startedAt, user.timeZone),
    endTime: outage.endedAt
      ? formatDateTime(outage.endedAt, user.timeZone)
      : undefined,
    status:
      outageStatus(outage) === 'ongoing' ? 'active' : 'resolved',
  }));

  return NextResponse.json(data);
}
