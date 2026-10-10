import React from 'react';
import Link from 'next/link';
import { OutageForm } from '../../components/OutageForm';
import { locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';

export const dynamic = 'force-dynamic';

export default async function NewOutagePage() {
  const user = await getCurrentUser();
  const list = await locations.list(user.id);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <Link
        href="/outages"
        className="text-[#3B82F6] hover:text-blue-400 text-sm font-medium flex items-center gap-2 transition-colors w-fit"
      >
        <span aria-hidden="true">←</span>
        Back to Outages
      </Link>

      <OutageForm locations={list.map((l) => ({ id: l.id, name: l.name }))} />
    </div>
  );
}