'use client';

import React, { useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Don't fire a pending search after the component unmounts.
  useEffect(() => () => clearTimeout(timer.current), []);

  function handleSearch(term: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      // A new search always starts at page 1.
      params.set('page', '1');

      if (term) {
        params.set('query', term);
      } else {
        params.delete('query');
      }

      replace(`${pathname}?${params.toString()}`);
    }, 300);
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-slate-600 bg-[#0F172A] py-[9px] pl-10 text-sm text-white outline-2 placeholder:text-slate-400 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        // Keep the input synchronized with the URL on first load
        defaultValue={searchParams.get('query')?.toString()}
      />

      {/* Magnifying glass icon */}
      <svg
        className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 peer-focus:text-[#3B82F6]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    </div>
  );
}