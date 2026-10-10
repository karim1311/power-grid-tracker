'use server'

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { validateSignup, DEFAULT_LOCATION_NAME } from "@/lib/validation/user"
import { users } from "@/lib/db/client"

export interface SignupState {
    error?: string;
    fieldErrors?: Record<string, string>;
}

export async function signup(
    _prevState: SignupState,
    formData: FormData,
): Promise<SignupState> {
    const validation = validateSignup({
        email: formData.get('email'),
        password: formData.get('password'),
        timeZone: formData.get('timeZone') || undefined,
        locationName: formData.get('locationName') || DEFAULT_LOCATION_NAME,
    });

    if (!validation.ok) {
        return {
            error: 'Please correct the information below.',
            fieldErrors: validation.fields,
        };
    }

    const { email, password, timeZone, locationName } = validation.value;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await users.createWithDefaultLocation({
        email,
        passwordHash,
        timeZone,
        locationName,
    });

    if (!result.ok) {
        return {
            error: 'Unable to create the account. The email may already be registered.',
            fieldErrors: result.fields,
        };
    }

    redirect('/login?registered=1')
}