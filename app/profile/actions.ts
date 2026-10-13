'use server';

import { revalidatePath } from 'next/cache';
import { users, locations } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { isValidTimeZone } from '@/lib/analytics/apportion';

export interface ProfileFormState {
  error?: string;
  saved?: boolean;
}

export async function updateTimeZone(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getCurrentUser();

  const timeZone = String(formData.get('timeZone') ?? '').trim();
  if (!timeZone || !isValidTimeZone(timeZone)) {
    return { error: 'Choose a valid time zone.' };
  }

  const updated = await users.updateTimeZone(user.id, timeZone);
  if (!updated) {
    return { error: 'Something went wrong. Please try again.' };
  }

  // Every page formats dates in the user's time zone, so refresh them all.
  revalidatePath('/', 'layout');
  return { saved: true };
}

export async function addLocation(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getCurrentUser();

  const result = await locations.create(user.id, {
    name: formData.get('name'),
  });

  if (!result.ok) {
    const message =
      result.fields && Object.values(result.fields)[0];

    return {
      error: message ?? 'Unable to add the location. Please try again.',
    };
  }

  revalidatePath('/profile');
  return { saved: true };
}