import React from 'react';
import { StatCard } from '../components/StatCard';
import { CompareSelect } from '../components/CompareSelect';
import { outages } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { computeDailySummaries, formatDuration } from '@/lib/analytics/daily';
import { addDaysToDay, localDayOf } from '@/lib/analytics/apportion';
import { compareMonthToDate, type CompareMode } from '@/lib/analytics/compare';

export const dynamic = 'force-dynamic';

const RECENT_DAYS = 7;

const OPTIONS: { value: CompareMode; label: string; phrase: string }[] = [
  { value: 'last-month', label: 'Last month', phrase: 'last month' },
  { value: 'last-year', label: 'Same month last year', phrase: 'this month last year' },
  { value: 'all-time', label: 'All-time average', phrase: 'the all-time monthly average' },
];

type Trend = 'up' | 'down' | 'neutral';

function trendOf(cur: number | null, base: number | null, threshold: number): Trend | undefined {
  if (cur === null || base === null) return undefined;
  const d = cur - base;
  if (Math.abs(d) < threshold) return 'neutral';
  return d > 0 ? 'up' : 'down';
}

const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const { compare } = await searchParams;
  const option = OPTIONS.find((o) => o.value === compare) ?? OPTIONS[0];

  const user = await getCurrentUser();
  const tz = user.timeZone;

  const [completed, ongoing] = await Promise.all([
    outages.list(user.id, { status: 'completed', limit: 500 }), // repo maximum
    outages.list(user.id, { status: 'ongoing' }),
  ]);

  const { current, baseline, throughDay } = compareMonthToDate(completed, option.value, tz);

  // Derived numbers. null = no data (never shown as a zero).
  const derive = (w: typeof current | null) => ({
    count: w ? w.count : null,
    avgMs: w && w.count > 0 ? w.totalMs / w.count : null,
    reliability: w && w.count > 0 && w.elapsedMs > 0 ? 1 - w.totalMs / w.elapsedMs : null,
  });
  const cur = derive(current);
  const base = derive(baseline);

  const vs = `than ${option.phrase}`;
  const noBaseline = baseline === null ? 'Nothing to compare against yet.' : undefined;

  const countTrend = trendOf(cur.count, base.count, 0.05);
  const avgTrend = trendOf(cur.avgMs, base.avgMs, 60_000);
  const relTrend = trendOf(cur.reliability, base.reliability, 0.0005);

  const countText =
    countTrend && base.count !== null && cur.count !== null
      ? countTrend === 'neutral'
        ? `Same as ${option.phrase}`
        : `${num(Math.abs(cur.count - base.count))} ${countTrend === 'up' ? 'more' : 'fewer'} ${vs}`
      : undefined;
  const avgText =
    avgTrend && base.avgMs !== null && cur.avgMs !== null
      ? avgTrend === 'neutral'
        ? `Same as ${option.phrase}`
        : `${formatDuration(Math.abs(cur.avgMs - base.avgMs))} ${avgTrend === 'up' ? 'longer' : 'shorter'} ${vs}`
      : undefined;
  const relText =
    relTrend && base.reliability !== null && cur.reliability !== null
      ? relTrend === 'neutral'
        ? `Same as ${option.phrase}`
        : `${Math.abs((cur.reliability - base.reliability) * 100).toFixed(1)} pts ${relTrend === 'up' ? 'higher' : 'lower'} ${vs}`
      : undefined;

  // Last 7 days, for the daily table
  const today = localDayOf(Date.now(), tz);
  const recent = computeDailySummaries(completed, addDaysToDay(today, -(RECENT_DAYS - 1)), today, tz).reverse();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4">

        {ongoing.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
            {ongoing.length === 1 ? '1 outage is still ongoing' : `${ongoing.length} outages are still ongoing`}{' '}
            and not included below. Ongoing outages are counted once they have an end time.
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">
            This month so far ({tz}). Trends compare days 1-{throughDay} of this month with the same days of{' '}
            {option.phrase}.
          </p>
        </div>
      
        <CompareSelect
          value={option.value}
          options={OPTIONS.map(({ value, label }) => ({ value, label }))}
        />
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Outages (This Month)"
          value={cur.count ?? 0}
          trend={countTrend}
          trendValue={countText}
          description={noBaseline}
        />
        <StatCard
          title="Average Downtime"
          value={cur.avgMs !== null ? formatDuration(cur.avgMs) : 'No data'}
          trend={avgTrend}
          trendValue={avgText}
          description={cur.avgMs === null ? 'No completed outages this month.' : noBaseline}
        />
        <StatCard
          title="Grid Reliability"
          value={cur.reliability !== null ? `${(cur.reliability * 100).toFixed(1)}%` : 'No data'}
          trend={relTrend}
          trendValue={relText}
          higherIsBetter
          description={
            cur.reliability !== null
              ? `Based on ${Math.round(current.elapsedMs / 3_600_000)} hours so far this month. Assumes the grid was up whenever no outage is logged.`
              : 'No completed outages this month.'
          }
        />
      </div>

      <section className="bg-[#1E293B] rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Daily Summary</h2>
        <p className="text-sm text-slate-500 mb-4">Last {RECENT_DAYS} days, newest first.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700">
                <th className="py-2 pr-4 font-medium">Day</th>
                <th className="py-2 pr-4 font-medium">Outages</th>
                <th className="py-2 pr-4 font-medium">Total downtime</th>
                <th className="py-2 font-medium">Average</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.day} className="border-b border-slate-700/50 last:border-b-0">
                  <td className="py-3 pr-4 text-white">{d.day}</td>
                  {d.status === 'no_data' ? (
                    <td colSpan={3} className="py-3 text-slate-500 italic">No data</td>
                  ) : (
                    <>
                      <td className="py-3 pr-4 text-slate-300">{d.outageCount}</td>
                      <td className="py-3 pr-4 text-slate-300">{formatDuration(d.totalDowntimeMs)}</td>
                      <td className="py-3 text-slate-300">{formatDuration(d.averageDowntimeMs ?? 0)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}