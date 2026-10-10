'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { outages } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { parseLocalDateTime } from '@/lib/format';

export interface OutageFormState {
  errors?: Record<string, string>;
  values?: { locationId: string; startTime: string; endTime: string; note: string };
}

export async function createOutage(
  _prev: OutageFormState,
  formData: FormData,
): Promise<OutageFormState> {
  const user = await getCurrentUser();

  const locationId = String(formData.get('locationId') ?? '');
  const startTime = String(formData.get('startTime') ?? '');
  const endTime = String(formData.get('endTime') ?? '');
  const note = String(formData.get('note') ?? '');
  const values = { locationId, startTime, endTime, note };

  // Empty -> undefined (not provided). Unparseable -> pass the raw string so validation flags it.
  const toInstant = (raw: string) =>
    raw === '' ? undefined : (parseLocalDateTime(raw, user.timeZone) ?? raw);

const result = await outages.create(user.id, {
  locationId,
  startedAt: toInstant(startTime),
  endedAt: toInstant(endTime),
  note,
});

  if (!result.ok) {
    const errors =
      result.code === 'not_found'
        ? { locationId: 'Choose a valid location.' }
        : (result.fields ?? { form: 'Something went wrong. Please try again.' });
    return { errors, values };
  }

  revalidatePath('/outages');
  redirect('/outages'); // must stay outside any try/catch
}