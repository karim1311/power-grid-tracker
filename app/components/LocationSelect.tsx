'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import {
  addLocation,
  type ProfileFormState,
} from '../profile/actions';

type LocationItem = {
  id: string;
  name: string;
  isPrimary: boolean;
};

export function LocationsSection({
  locations,
}: {
  locations: LocationItem[];
}) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(addLocation, {});

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) {
      formRef.current?.reset();
    }
  }, [state.saved]);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium text-slate-200">
          Locations
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Manage the locations associated with your account.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {locations.length === 0 ? (
          <p className="text-sm text-slate-400">
            No locations found.
          </p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-[#0F172A] p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-white break-words">
                  {location.name}
                </p>
              </div>

              {location.isPrimary && (
                <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  Primary
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4 border-t border-slate-700 pt-6"
      >
        <h4 className="font-medium text-slate-200">
          Add a location
        </h4>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="location-name"
            className="text-sm font-medium text-slate-300"
          >
            Location name
          </label>

          <input
            id="location-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. My Home"
            className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3"
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-red-400">
            {state.error}
          </p>
        )}

        {state.saved && (
          <p role="status" className="text-sm text-green-400">
            Location added successfully.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
          >
            {pending ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </form>
    </section>
  );
}