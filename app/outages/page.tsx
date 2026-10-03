import React from 'react';
import { OutageListItem } from '../components/OutageListItem';

export default function OutagesList() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Power Outages</h1>
          <p className="text-slate-400">View and filter historical outage records.</p>
        </div>
        
        {/* Placeholder for future search/filter bar */}
        <button className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Log New Outage
        </button>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-4 mt-4">
        <OutageListItem 
          id="outage-1"
          locationName="Downtown Sector A"
          startTime="Oct 3, 2026 - 14:30"
          status="active"
        />
        <OutageListItem 
          id="outage-2"
          locationName="North Hills Residential"
          startTime="Oct 1, 2026 - 08:15"
          endTime="Oct 1, 2026 - 11:45"
          status="resolved"
        />
        <OutageListItem 
          id="outage-3"
          locationName="Westside Industrial Park"
          startTime="Sep 28, 2026 - 18:00"
          endTime="Sep 28, 2026 - 19:30"
          status="resolved"
        />
      </div>
    </div>
  );
}