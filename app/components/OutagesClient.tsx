
'use client';

import { useEffect, useState } from 'react';
import { OutageListItem } from '../components/OutageListItem';

type Outage = {
  id: string;
  locationName: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'resolved';
};

export function OutagesClient() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOutages() {
      try {
        const response = await fetch('/api/outages', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load outages');
        }

        const data: Outage[] = await response.json();
        setOutages(data);
      } catch (err) {
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

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading outages...</p>;
  }

  if (error) {
    return (
      <p className="text-red-400">
        Could not load outages. Please try again.
      </p>
    );
  }

  if (outages.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        No outages logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {outages.map((outage) => (
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
  );
}
