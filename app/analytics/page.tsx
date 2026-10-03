import React from 'react';
import { ChargingGuidanceCard } from '../components/ChargingGuidanceCard';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Planning</h1>
        <p className="text-slate-400">Review grid trends and prepare your backup systems.</p>
      </div>

      {/* Charging Guidance Section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-slate-200">Action Required</h2>
        <ChargingGuidanceCard 
          actionPriority="High"
          recommendedWindow="Today, 14:00 - 18:00"
          estimatedNextOutage="Today, 18:30"
        />
      </section>

      {/* Placeholder for Reliability Charts */}
      <section className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-semibold text-slate-200">Historical Reliability</h2>
        <div className="bg-[#1E293B] rounded-xl p-8 border border-slate-700 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">
            Interactive charts will be rendered here once the database is connected.
          </p>
        </div>
      </section>
    </div>
  );
}