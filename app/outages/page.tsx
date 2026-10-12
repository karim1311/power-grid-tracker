import React from 'react';
import Link from 'next/link';
import { OutagesClient } from '../components/OutagesClient';

export const dynamic = 'force-dynamic';

export default async function OutagesList() {
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
        <OutagesClient />
      </div>
    </div>
  );
}