'use client'

import { signOut } from "next-auth/react"

export function SignOutButton() {
    return (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="rounded border border-slate-500 px-3 py-2 hover:bg-slate-700"
        >
            Sign Out
        </button>
    )
}