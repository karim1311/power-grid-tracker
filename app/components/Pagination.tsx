
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get the current page from the URL, defaulting to 1
  const currentPage = Number(searchParams.get('page')) || 1;

  // Helper function to build the new URL with the updated page number
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-700">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
          currentPage <= 1 
            ? 'pointer-events-none text-slate-500 border-slate-700 bg-slate-800' 
            : 'text-white border-slate-600 bg-[#1E293B] hover:bg-slate-700'
        }`}
        aria-disabled={currentPage <= 1}
      >
        Previous
      </Link>
      
      <span className="text-sm font-medium text-slate-300">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
          currentPage >= totalPages 
            ? 'pointer-events-none text-slate-500 border-slate-700 bg-slate-800' 
            : 'text-white border-slate-600 bg-[#1E293B] hover:bg-slate-700'
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        Next
      </Link>
    </div>
  );
}