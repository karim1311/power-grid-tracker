import React from 'react';

export default function Loading() {
  // This skeleton will be automatically shown by Next.js while the page data is fetching (Week 03 Streaming)
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      
      {/* Page Header Skeleton */}
      <div>
        <div className="h-9 bg-slate-700 rounded-md w-48 mb-3"></div>
        <div className="h-5 bg-slate-800 rounded-md w-3/4 max-w-md"></div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simulating the 3 StatCards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-6 border border-slate-700 flex flex-col gap-3 h-[120px]">
            <div className="h-4 bg-slate-600 rounded w-1/2"></div>
            <div className="flex items-baseline gap-3 mt-2">
              <div className="h-8 bg-slate-500 rounded w-16"></div>
              <div className="h-4 bg-slate-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-[#1E293B] rounded-xl p-8 border border-slate-700 min-h-[300px] flex flex-col items-center justify-center gap-4">
        <div className="h-6 bg-slate-600 rounded w-48 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-full max-w-md"></div>
        <div className="h-4 bg-slate-800 rounded w-3/4 max-w-sm"></div>
      </div>
      
    </div>
  );
}