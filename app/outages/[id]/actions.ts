'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { outages } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { parseLocalDateTime } from '@/lib/format';
import type { OutageFormState } from '../actions';

function refresh(id: string) {
  revalidatePath('/outages');
  revalidatePath(`/outages/${id}`);
  revalidatePath('/dashboard');
}

/** Ends an ongoing outage at the current moment. */
export async function resolveOutage(id: string): Promise<void> {
  const user = await getCurrentUser();

  const existing = await outages.get(user.id, id);
  if (!existing || existing.endedAt !== null) return; // missing or already resolved

  await outages.update(user.id, id, { endedAt: new Date() });
  refresh(id);
}

export async function deleteOutage(id: string): Promise<void> {
  const user = await getCurrentUser();
  await outages.delete(user.id, id);
  revalidatePath('/outages');
  revalidatePath('/dashboard');
  redirect('/outages'); // must stay outside any try/catch
}

export async function updateOutage(
  id: string,
  _prev: OutageFormState,
  formData: FormData,
): Promise<OutageFormState> {
  const user = await getCurrentUser();

  const locationId = String(formData.get('locationId') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const note = String(formData.get('note') ?? '');
  const values = { locationId, startTime, endTime, note };

  // For updates, blank must be null (explicitly cleared), not undefined (keep the old value).
  const toInstant = (raw: string) =>
    raw === '' ? null : (parseLocalDateTime(raw, user.timeZone) ?? raw);

  const result = await outages.update(user.id, id, {
    locationId,
    startedAt: toInstant(startTime),
    endedAt: toInstant(endTime),
    note,
  });

  if (!result.ok) {
    if (result.code === 'not_found') redirect('/outages'); // deleted in another tab
    return {
      errors: result.fields ?? { form: 'Something went wrong. Please try again.' },
      values,
    };
  }

  refresh(id);
  redirect(`/outages/${id}`);
}