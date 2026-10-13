import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OutageForm } from '../../../components/OutageForm';
import { locations, outages } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { toDateTimeLocalValue } from '@/lib/format';
import { updateOutage } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditOutagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [outage, list] = await Promise.all([
    outages.get(user.id, id),
    locations.list(user.id),
  ]);
  if (!outage) notFound();

  const tz = user.timeZone;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <Link
        href={`/outages/${outage.id}`}
        className="text-[#3B82F6] hover:text-blue-400 text-sm font-medium flex items-center gap-2 transition-colors w-fit"
      >
        <span aria-hidden="true">←</span>
        Back to Outage
      </Link>

      <OutageForm
        locations={list.map((l) => ({ id: l.id, name: l.name }))}
        action={updateOutage.bind(null, outage.id)}
        initialValues={{
          locationId: outage.locationId,
          startTime: toDateTimeLocalValue(outage.startedAt, tz),
          endTime: outage.endedAt ? toDateTimeLocalValue(outage.endedAt, tz) : '',
          note: outage.note ?? '',
        }}
        title="Edit Power Outage"
        description={`Times are shown in your time zone (${tz}).`}
        submitLabel="Save Changes"
        pendingLabel="Saving..."
        cancelHref={`/outages/${outage.id}`}
      />
    </div>
  );
}