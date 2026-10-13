import React from 'react';
import { ChargingGuidanceCard } from '../components/ChargingGuidanceCard';
import { outages } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { computeGuidance, startsByHour, LOOKBACK_DAYS } from '@/lib/analytics/guidance';

export const dynamic = 'force-dynamic';

const Notice = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700 text-sm text-slate-300">
    {children}
  </div>
);

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const tz = user.timeZone;

  const all = await outages.list(user.id, { limit: 500 });
  const now = Date.now();
  const guidance = computeGuidance(all, tz, now);
  const { hours, total } = startsByHour(all, tz, now);
  const max = Math.max(...hours, 1);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Planning</h1>
        <p className="text-slate-400">
          Based on your last {LOOKBACK_DAYS} days of outages. Times are in {tz}.
        </p>
      </div>

      {/* Charging Guidance Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-200">Charging Guidance</h2>

        {guidance.kind === 'pattern' && (
          <ChargingGuidanceCard
            actionPriority={guidance.priority}
            recommendedWindow={guidance.chargeWindow}
            estimatedNextOutage={guidance.nextWindow}
            basis={guidance.basis}
          />
        )}

        {guidance.kind === 'not_enough_data' && (
          <Notice>
            Log at least {guidance.needed} outages to get charging guidance. You have{' '}
            {guidance.count} in the last {LOOKBACK_DAYS} days.
          </Notice>
        )}

        {guidance.kind === 'no_pattern' && (
          <Notice>
            Your {guidance.count} recent outages are spread across the day, so there is no
            reliable time to plan around. Keeping your backup power topped up is the safest
            approach.
          </Notice>
        )}
      </section>

      {/* When do outages start? */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-200">When Outages Start</h2>
        <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700">
          {total === 0 ? (
            <p className="text-slate-500 text-sm">No outages logged in the last {LOOKBACK_DAYS} days.</p>
          ) : (
            <>
              <div
                className="flex items-end gap-1 h-40"
                role="img"
                aria-label="Bar chart of how many outages started in each hour of the day"
              >
                {hours.map((count, h) => (
                  <div
                    key={h}
                    className="flex-1 rounded-t bg-[#3B82F6]"
                    style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                    title={`${String(h).padStart(2, '0')}:00 - ${count} outage${count === 1 ? '' : 's'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Each bar is one hour of the day. Taller bars mean more outages started then.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}