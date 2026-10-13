'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { updateTimeZone, type ProfileFormState } from '../profile/actions';

export function ProfileForm({
  currentTimeZone,
  timeZones,
}: {
  currentTimeZone: string;
  timeZones: string[];
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateTimeZone,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <h3 className="text-lg font-medium text-slate-200">Preferences</h3>

      <div className="flex flex-col gap-2">
        <label htmlFor="timeZone" className="text-sm font-medium text-slate-300">
          Time zone
        </label>
        <select
          id="timeZone"
          name="timeZone"
          defaultValue={currentTimeZone}
          className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors"
        >
          {timeZones.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          Outage times and daily summaries are shown in this time zone.
        </span>
        {state.error && (
          <p role="alert" className="text-sm text-red-400">{state.error}</p>
        )}
        {state.saved && (
          <p role="status" className="text-sm text-green-400">Time zone saved.</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-slate-700">
        <Link
          href="/dashboard"
          className="px-6 py-2.5 text-sm font-medium text-slate-300 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-center"
        >
          Back to Dashboard
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}