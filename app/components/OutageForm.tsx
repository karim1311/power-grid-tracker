'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { createOutage, type OutageFormState } from '../outages/actions';

interface OutageFormProps {
  locations: { id: string; name: string }[];
}

const inputClass =
  'bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors';

const FieldError = ({ message }: { message?: string }) =>
  message ? <span className="text-xs text-red-400">{message}</span> : null;

export const OutageForm = ({ locations }: OutageFormProps) => {
  const [state, formAction, pending] = useActionState<OutageFormState, FormData>(createOutage, {});
  const errors = state.errors ?? {};

  return (
    <form
      action={formAction}
      className="bg-[#1E293B] p-6 sm:p-8 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-6 max-w-2xl mx-auto w-full"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Log Power Outage</h2>
        <p className="text-sm text-slate-400">Enter the details of the grid failure below.</p>
      </div>

      {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}

      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="text-sm font-medium text-slate-300">Location</label>
        <select
          id="location"
          name="locationId"
          className={inputClass}
          defaultValue={state.values?.locationId ?? ''}
          required
        >
          <option value="">Select a monitored location...</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <FieldError message={errors.locationId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="startTime" className="text-sm font-medium text-slate-300">Start Time</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            className={`${inputClass} text-slate-300`}
            defaultValue={state.values?.startTime ?? ''}
            required
          />
          <FieldError message={errors.startedAt} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endTime" className="text-sm font-medium text-slate-300">
            End Time <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            className={`${inputClass} text-slate-300`}
            defaultValue={state.values?.endTime ?? ''}
          />
          <span className="text-xs text-slate-500">Leave blank if the outage is currently ongoing.</span>
          <FieldError message={errors.endedAt} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium text-slate-300">
          Note <span className="text-slate-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={500}
          className={inputClass}
          defaultValue={state.values?.note ?? ''}
          placeholder="Anything worth remembering, like the cause or what you noticed."
        />
        <span className="text-xs text-slate-500">Up to 500 characters. Shown on the outage's detail page.</span>
        <FieldError message={errors.note} />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-4 pt-6 border-t border-slate-700">
        <Link
          href="/outages"
          className="px-6 py-2.5 text-sm font-medium text-slate-300 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  );
};