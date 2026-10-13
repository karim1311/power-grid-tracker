import React, { Suspense } from 'react';
import Link from 'next/link';
import Search from '../components/Search';
import { OutagesClient } from '../components/OutagesClient';

export default function OutagesList() {
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
        <Suspense>
          <Search placeholder="Search by location or status..." />
        </Suspense>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <Suspense fallback={<p className="text-slate-400">Loading outages...</p>}>
          <OutagesClient />
        </Suspense>
      </div>
    </div>
  );
}