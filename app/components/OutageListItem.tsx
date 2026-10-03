import React from 'react';
import Link from 'next/link';

// Defining the shape of our data using TypeScript interfaces (Week 02)
interface OutageListItemProps {
  id: string;
  locationName: string;
  startTime: string;
  endTime?: string; // Optional because an outage might still be active
  status: 'active' | 'resolved';
}

export const OutageListItem = ({ 
  id, 
  locationName, 
  startTime, 
  endTime, 
  status 
}: OutageListItemProps) => {
  return (
    <div className="bg-[#1E293B] p-5 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-500 transition-colors shadow-sm">
      
      {/* Outage Details */}
      <div>
        <h4 className="text-lg font-semibold text-white">{locationName}</h4>
        <div className="text-sm text-slate-400 mt-1 space-y-1">
          <p>Started: {startTime}</p>
          {endTime ? (
            <p>Ended: {endTime}</p>
          ) : (
            <p className="text-slate-500 italic">Ongoing...</p>
          )}
        </div>
      </div>
      
      {/* Status Badge & Action Link */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Dynamic badge color based on status */}
        <span 
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'active' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'bg-green-500/10 text-green-400 border border-green-500/20'
          }`}
        >
          {status}
        </span>
        
        {/* Next.js Link for Page Navigation (Week 02) */}
        <Link 
          href={`/outages/${id}`} 
          className="text-[#3B82F6] hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          View Details
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      
    </div>
  );
};