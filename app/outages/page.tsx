import React from 'react';
import Link from 'next/link';
import { OutageListItem } from '../components/OutageListItem';
import { outages, locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { formatDateTime } from '@/lib/format';
import { outageStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OutagesList() {
  const user = await getCurrentUser();
  const [outageList, locationList] = await Promise.all([
    outages.list(user.id),
    locations.list(user.id),
  ]);
  const locationNames = new Map(locationList.map((l) => [l.id, l.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Power Outages</h1>
          <p className="text-slate-400">View and filter historical outage records.</p>
        </div>

        <Link
          href="/outages/new"
          className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Log New Outage
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {outageList.length === 0 ? (
          <p className="text-slate-500 text-sm">No outages logged yet.</p>
        ) : (
          outageList.map((o) => (
            <OutageListItem
              key={o.id}
              id={o.id}
              locationName={locationNames.get(o.locationId) ?? 'Unknown location'}
              startTime={formatDateTime(o.startedAt, user.timeZone)}
              endTime={o.endedAt ? formatDateTime(o.endedAt, user.timeZone) : undefined}
              status={outageStatus(o) === 'ongoing' ? 'active' : 'resolved'}
            />
          ))
        )}
      </div>
    </div>
  );
}