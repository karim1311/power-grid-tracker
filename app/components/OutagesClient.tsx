'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OutageListItem } from './OutageListItem';
import Pagination from './Pagination';

type Outage = {
  id: string;
  locationName: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'resolved';
};

type OutagesResponse = {
  items: Outage[];
  page: number;
  totalPages: number;
  total: number;
};

export function OutagesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') ?? '';
  const page = searchParams.get('page') ?? '1';

  const [data, setData] = useState<OutagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOutages() {
      setLoading(true);
      setError(false);

      const params = new URLSearchParams({ page });
      if (query) params.set('query', query);

      try {
        const response = await fetch(`/api/outages?${params.toString()}`, {
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to load outages');
        }

        setData((await response.json()) as OutagesResponse);
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadOutages();

    // Cancels the previous request when the search or page changes.
    return () => controller.abort();
  }, [query, page, router]);

  // First load only: keep showing old results while a new page loads.
  if (loading && !data) {
    return <p className="text-slate-400">Loading outages...</p>;
  }

  if (error) {
    return (
      <p className="text-red-400">
        Could not load outages. Please try again.
      </p>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        {query ? `No outages match "${query}".` : 'No outages logged yet.'}
      </p>
    );
  }

  return (
    <>
      <div
        className={`flex flex-col gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`}
      >
        {data.items.map((outage) => (
          <OutageListItem
            key={outage.id}
            id={outage.id}
            locationName={outage.locationName}
            startTime={outage.startTime}
            endTime={outage.endTime}
            status={outage.status}
          />
        ))}
      </div>

      <Pagination totalPages={data.totalPages} />
    </>
  );
}