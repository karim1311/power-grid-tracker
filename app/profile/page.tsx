import React from 'react';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { locations } from '@/lib/db/client'; // adjust to your actual path
import { ProfileForm } from '../components/ProfileForm';
import { LocationsSection } from '../components/LocationSelect';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const userLocations = await locations.list(user.id);

  const timeZones = Intl.supportedValuesOf('timeZone');
  if (!timeZones.includes('UTC')) timeZones.unshift('UTC');
  if (!timeZones.includes(user.timeZone)) {
    timeZones.unshift(user.timeZone);
  }

  const initial = user.email.charAt(0).toUpperCase();
  const memberSince = new Intl.DateTimeFormat('en-US', {
    timeZone: user.timeZone,
    month: 'long',
    year: 'numeric',
  }).format(user.createdAt);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          My Profile
        </h1>
        <p className="text-slate-400">
          Manage your account settings.
        </p>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 md:p-8 border border-slate-700 shadow-sm flex flex-col gap-8">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-700">
          <div className="w-20 h-20 rounded-full bg-[#3B82F6] flex items-center justify-center text-2xl font-bold text-white shadow-inner">
            {initial}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-white break-words">
              {user.email}
            </h2>
            <p className="text-slate-400 mt-1">
              Member since {memberSince}
            </p>
          </div>
        </div>

        <ProfileForm
          key={user.timeZone}
          currentTimeZone={user.timeZone}
          timeZones={timeZones}
        />

        <div className="border-t border-slate-700 pt-8">
          <LocationsSection locations={userLocations} />
        </div>
      </div>
    </div>
  );
}