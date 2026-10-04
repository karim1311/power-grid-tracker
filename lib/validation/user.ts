import { Result, ok, fail } from '../types';
import { isValidTimeZone } from '../analytics/apportion';

// The spec says "published password rules" but doesn't define them. These are
// assumptions: change them here and nowhere else.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_LOCATION_NAME_LENGTH = 100;
export const DEFAULT_LOCATION_NAME = 'My Home';

export interface SignupInput {
  email?: unknown;
  password?: unknown;
  timeZone?: unknown;
  locationName?: unknown;
}

export interface ValidSignup {
  email: string; // trimmed and lowercased
  password: string; // plaintext: hash it immediately, never store or log it
  timeZone: string;
  locationName: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function validateSignup(input: SignupInput): Result<ValidSignup> {
  const errors: Record<string, string> = {};

  let email = '';
  if (typeof input.email !== 'string' || input.email.trim() === '') {
    errors.email = 'Email is required.';
  } else {
    email = normalizeEmail(input.email);
    if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  }

  let password = '';
  if (typeof input.password !== 'string' || input.password === '') {
    errors.password = 'Password is required.';
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  } else if (input.password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`;
  } else {
    password = input.password;
  }

  let timeZone = 'UTC';
  if (input.timeZone !== undefined && input.timeZone !== null && input.timeZone !== '') {
    if (typeof input.timeZone !== 'string' || !isValidTimeZone(input.timeZone)) {
      errors.timeZone = 'Choose a valid time zone.';
    } else {
      timeZone = input.timeZone;
    }
  }

  let locationName = DEFAULT_LOCATION_NAME;
  if (input.locationName !== undefined && input.locationName !== null) {
    if (typeof input.locationName !== 'string') {
      errors.locationName = 'Location name must be text.';
    } else if (input.locationName.trim() !== '') {
      locationName = input.locationName.trim();
      if (locationName.length > MAX_LOCATION_NAME_LENGTH) {
        errors.locationName = `Location name must be ${MAX_LOCATION_NAME_LENGTH} characters or fewer.`;
      }
    }
  }

  if (Object.keys(errors).length > 0) return fail('validation', errors);
  return ok({ email, password, timeZone, locationName });
}