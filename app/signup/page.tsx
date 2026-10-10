'use client'

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-3xl font-bold">Create your Gridlog account</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-400">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
          />
          <p className="mt-1 text-sm text-slate-400">
            Use between 8 and 128 characters.
          </p>
          {state.fieldErrors?.password && (
            <p className="mt-1 text-sm text-red-400">{state.fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="timeZone" className="mb-1 block">Time zone</label>
          <input
            id="timeZone"
            name="timeZone"
            defaultValue="America/Mazatlan"
            className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
          />
          <p className="mt-1 text-sm text-slate-400">Example: America/Mazatlan</p>
          {state.fieldErrors?.timeZone && (
            <p className="mt-1 text-sm text-red-400">{state.fieldErrors.timeZone}</p>
          )}
        </div>

        <div>
          <label htmlFor="locationName" className="mb-1 block">Primary location</label>
          <input
            id="locationName"
            name="locationName"
            defaultValue="My Home"
            maxLength={100}
            required
            className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
          />
          {state.fieldErrors?.locationName && (
            <p className="mt-1 text-sm text-red-400">{state.fieldErrors.locationName}</p>
          )}
        </div>

        {state.error && (
          <p role="alert" className="red-text-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-600 p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-300">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 underline">
          Log in
        </Link>
      </p>
    </section>
  );
}