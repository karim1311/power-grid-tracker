import React from 'react';
import { OutageListItem } from '../components/OutageListItem';
import Search from '../components/Search';
import Pagination from '../components/Pagination'; // Import the new Pagination component
import Link from 'next/link';

export default function OutagesList() {
  // Temporary mock value for total pages (Week 03 Database Integration will replace this)
  const totalPages = 3; 

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Power Outages</h1>
          <p className="text-slate-400">View and filter historical outage records.</p>
        </div>
        
        <Link 
          href="/outages/new"
          className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          + Log New Outage
        </Link>
      </div>

      {/* Search Bar Container */}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search by location or status..." />
      </div>

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
      </div>

      {/* Pagination Component */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}