import React from 'react';
import { StatCard } from '../components/StatCard';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back. Here is your recent power grid reliability summary.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Outages (This Month)" 
          value={12} 
          trend="up" 
          trendValue="2 more than last month"
        />
        <StatCard 
          title="Average Downtime" 
          value="4h 15m" 
          trend="down" 
          trendValue="30m less than average"
        />
        <StatCard 
          title="Grid Reliability" 
          value="94.5%" 
          description="Based on 720 hours tracked this month"
          trend="neutral"
        />
      </div>

      {/* Placeholder for future Data Fetching (Week 03) */}
      <div className="bg-[#1E293B] rounded-xl p-8 border border-slate-700 min-h-[300px] flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium text-slate-300 mb-2">Recent Outages Activity</h3>
        <p className="text-slate-500 text-sm max-w-md">
          This section will display the dynamic list of recent outages once the database connectivity is implemented.
        </p>
      </div>
    </div>
  );
}