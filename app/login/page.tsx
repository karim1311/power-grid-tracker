'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function LoginPage() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setError('');
        setPending(true)

        try {
            const result = await signIn('credentials', {
                email: formData.get('email'),
                password: formData.get('password'),
                redirect: false,
            });

            if (result?.error) {
                setError('Incorrect Email or password.');
                return;
            }

            window.location.href = '/dashboard'
        } catch {
            setError('Could not sign In. Try Again.');
        } finally {
            setPending(false);
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <h1 className="mb-6 text-3xl font-bold">Log in to Gridlog</h1>

            <form action={handleSubmit} className="space-4">
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
                <Link href="signup" className="text-blue-400 underline">
                Sign up</Link>
            </p>
        </section>
    )
}