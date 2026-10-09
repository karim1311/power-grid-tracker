import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { outages, locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { formatDateTime } from '@/lib/format';
import { formatDuration } from '@/lib/analytics/daily';
import { outageStatus, outageDurationMs } from '@/lib/types';

export const dynamic = 'force-dynamic';

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 py-3 border-b border-slate-700 last:border-b-0">
    <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="text-sm text-white break-words">{children}</dd>
  </div>
);

export default async function OutageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const outage = await outages.get(user.id, id);
  if (!outage) notFound();

  const [location, overlapping] = await Promise.all([
    locations.get(user.id, outage.locationId),
    outages.findPossibleDuplicates(
      user.id,
      outage.locationId,
      outage.startedAt,
      outage.endedAt,
      outage.id,
    ),
  ]);

  const ongoing = outageStatus(outage) === 'ongoing';
  const durationMs = outageDurationMs(outage);
  const tz = user.timeZone;
  const fmt = (d: Date) => formatDateTime(d, tz);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <Link
        href="/outages"
        className="text-[#3B82F6] hover:text-blue-400 text-sm font-medium flex items-center gap-2 transition-colors w-fit"
      >
        <span aria-hidden="true">←</span>
        Back to Outages
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{location?.name ?? 'Unknown location'}</h1>
          <p className="text-slate-400">Outage details</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
            ongoing
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-green-500/10 text-green-400 border border-green-500/20'
          }`}
        >
          {ongoing ? 'active' : 'resolved'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timing */}
        <section className="bg-[#1E293B] rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Timing</h2>
          <dl>
            <Row label="Started">{fmt(outage.startedAt)}</Row>
            <Row label="Ended">
              {outage.endedAt ? fmt(outage.endedAt) : <span className="italic text-slate-400">Ongoing...</span>}
            </Row>
            <Row label={ongoing ? 'Duration so far' : 'Duration'}>
              {formatDuration(durationMs ?? Date.now() - outage.startedAt.getTime())}
            </Row>
            <Row label="Time zone">{tz}</Row>
          </dl>
        </section>

        {/* Location */}
        <section className="bg-[#1E293B] rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">Location</h2>
          <dl>
            <Row label="Name">{location?.name ?? 'Unknown'}</Row>
            <Row label="Primary location">{location ? (location.isPrimary ? 'Yes' : 'No') : '—'}</Row>
          </dl>
        </section>
      </div>

      {/* Note */}
      <section className="bg-[#1E293B] rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-2">Note</h2>
        {outage.note ? (
          <p className="text-sm text-white whitespace-pre-wrap">{outage.note}</p>
        ) : (
          <p className="text-sm text-slate-500 italic">No note was added.</p>
        )}
      </section>

      {/* Overlapping outages */}
      {overlapping.length > 0 && (
        <section className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-1">Possible duplicates</h2>
          <p className="text-sm text-slate-300 mb-3">
            These outages at the same location overlap this one in time.
          </p>
          <ul className="flex flex-col gap-2">
            {overlapping.map((o) => (
              <li key={o.id}>
                <Link href={`/outages/${o.id}`} className="text-sm text-[#3B82F6] hover:text-blue-400">
                  {fmt(o.startedAt)} → {o.endedAt ? fmt(o.endedAt) : 'ongoing'}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}