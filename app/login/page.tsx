'use client'

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get('registered') === '1';

    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError('');
        setPending(true);

        try {
            const result = await signIn('credentials', {
                email: formData.get('email'),
                password: formData.get('password'),
                redirect: false,
            });

            if (result?.error) {
                // Only wrong email/password gets the "incorrect" message.
                // Anything else (missing secret, database down) is a real
                // problem, so don't blame the user's password for it.
                if (result.error === 'CredentialsSignin' || result.code === 'credentials') {
                    setError('Incorrect email or password.');
                } else {
                    console.error('Sign in failed:', result.error, result.code);
                    setError('Something went wrong on our end. Please try again.');
                }
                return;
            }

            router.push('/dashboard');
            router.refresh(); // re-render the header with the logged-in state
        } catch {
            setError('Could not sign in. Please try again.');
        } finally {
            setPending(false);
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <h1 className="mb-6 text-3xl font-bold">Log in to GridLog</h1>

            {justRegistered && (
                <p
                    role="status"
                    className="mb-4 rounded border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400"
                >
                    Account created. Log in to get started.
                </p>
            )}

            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1 block">
                        Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="mb-1 block">
                        Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded border border-slate-500 bg-slate-800 p-3 text-white"
                    />
                </div>

                {error && (
                    <p role="alert" className="text-red-400">
                        {error}
                    </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded bg-blue-600 p-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    {pending ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-300">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-400 underline">
                    Sign up
                </Link>
            </p>
        </section>
    )
}

// useSearchParams needs a Suspense boundary or `next build` fails.
export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}