import { Result, ok, fail } from '../types';

export const MAX_NOTE_LENGTH = 500;
/** Tolerate small clock differences between a user's device and the server, so legitimate start times
 * don't get rejected as future times.
 */
export const CLOCK_SKEW_MS = 60_000;

/** Raw, untrusted input (e.g. a parsed JSON body). */
export interface OutageInput {
  locationId?: unknown;
  startedAt?: unknown;
  endedAt?: unknown;
  note?: unknown;
}

export interface ValidOutage {
  locationId: string;
  startedAt: Date;
  endedAt: Date | null;
  note: string | null;
}

/** null = not provided, 'invalid' = provided but unparseable. */
function parseInstant(value: unknown): Date | 'invalid' | null {
  if (value === undefined || value === null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? 'invalid' : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? 'invalid' : d;
  }
  return 'invalid';
}

/** Validates a complete outage (used for create, and for update after merging). */
export function validateOutage(input: OutageInput, now: Date = new Date()): Result<ValidOutage> {
  const errors: Record<string, string> = {};
  const latest = now.getTime() + CLOCK_SKEW_MS;

  // checks if they added a location
  if (typeof input.locationId !== 'string' || input.locationId.trim() === '') {
    errors.locationId = 'Choose a location.';
  }


  // validates the start and end times
  const start = parseInstant(input.startedAt);
  const end = parseInstant(input.endedAt);

  if (start === 'invalid') {
    errors.startedAt = 'Enter a valid start date and time.';
  } else if (start === null) {
    errors.startedAt =
      end !== null
        ? 'Add a start time. An end time needs a start time.'
        : 'Start time is required.';
  } else if (start.getTime() > latest) {
    errors.startedAt = 'Start time cannot be in the future.';
  }

  if (end === 'invalid') {
    errors.endedAt = 'Enter a valid end date and time.';
  } else if (end !== null) {
    if (end.getTime() > latest) {
      errors.endedAt = 'End time cannot be in the future.';
    } else if (start instanceof Date && end.getTime() <= start.getTime()) {
      errors.endedAt = 'End time must be after the start time.';
    }
  }

  let note: string | null = null;
  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== 'string') {
      errors.note = 'Note must be text.';
    } else {
      const trimmed = input.note.trim();
      if (trimmed.length > MAX_NOTE_LENGTH) {
        errors.note = `Note must be ${MAX_NOTE_LENGTH} characters or fewer.`;
      } else {
        note = trimmed === '' ? null : trimmed;
      }
    }
  }

  if (Object.keys(errors).length > 0) return fail('validation', errors);

  return ok({
    locationId: input.locationId as string,
    startedAt: start as Date,
    endedAt: end instanceof Date ? end : null,
    note,
  });
}

/**
 * Applies a partial update on top of an existing record, then validates
 * the merged result. Omitted fields keep their current value; explicit null
 * clears endedAt (reopens the outage) or note.
 */
export function validateOutageUpdate(
  existing: { locationId: string; startedAt: Date; endedAt: Date | null; note: string | null },
  patch: OutageInput,
  now: Date = new Date(),
): Result<ValidOutage> {
  return validateOutage(
    {
      locationId: patch.locationId !== undefined ? patch.locationId : existing.locationId,
      startedAt: patch.startedAt !== undefined ? patch.startedAt : existing.startedAt,
      endedAt: patch.endedAt !== undefined ? patch.endedAt : existing.endedAt,
      note: patch.note !== undefined ? patch.note : existing.note,
    },
    now,
  );
}