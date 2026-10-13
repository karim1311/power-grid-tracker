'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignOutButton } from '../auth/sign-out-button';
import { NAV_LINKS } from './navLinks';

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <div className="md:hidden flex items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="cursor-pointer text-slate-300 hover:text-white p-2"
        >
          <span className="sr-only">Toggle main menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-slate-700 shadow-lg flex flex-col px-6 py-4 gap-4 md:hidden"
        >
          {isLoggedIn ? (
            <>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="text-slate-300 hover:text-white block text-base font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-700">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" onClick={close} className="block text-slate-300 hover:text-white text-base font-medium">
                Log in
              </Link>
              <Link href="/signup" onClick={close} className="block text-[#3B82F6] font-medium text-base">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}