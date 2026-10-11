'use client'

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function OutageSearch() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { push } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        
        params.set('page', '1'); // always reset to page 1 on a new search

        push(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <input
            type="search"
            placeholder="Search by date, location, or status..."
            defaultValue={searchParams.get('query')?.toString() }
            onChange={ (e) => handleSearch(e.target.value) }
            aria-label="Search outages" 
            className="text-slate-400 mt-1 space-y-4 p-2"
        />
    )

}