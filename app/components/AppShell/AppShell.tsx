import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from '../auth/sign-out-button';

export const AppShell = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-white font-sans">
      
      {/* Main Header */}
      <header className="bg-[#1E293B] border-b border-slate-700 shadow-sm relative z-50">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          
          <div className="flex items-center gap-2">
            {/* Logo / Brand - Now links to homepage */}
            <Link href="/" className="text-2xl font-bold text-[#3B82F6] hover:text-blue-400 transition-colors">
              GridLog
            </Link>
          </div>
          
          {/* Desktop Navigation (Hidden on mobile) */}
          {isLoggedIn && (
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="hover:text-[#3B82F6] transition-colors">Dashboard</Link>
              <Link href="/outages" className="hover:text-[#3B82F6] transition-colors">Outages</Link>
              <Link href="/profile" className="hover:text-[#3B82F6] transition-colors">Profile</Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <SignOutButton />
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded text-sm font-medium bg-[#3B82F6] hover:bg-blue-600 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Label/Button (Visible only on mobile) */}
            <div className="md:hidden flex items-center">
              <label htmlFor="mobile-menu-toggle" className="cursor-pointer text-slate-300 hover:text-white p-2">
                <span className="sr-only">Toggle main menu</span>
                {/* Hamburger Icon */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
            </div>
          </div>
        </div>

        {/* Hidden Checkbox for CSS-only mobile menu state */}
        <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />

        {/* Mobile Dropdown Menu (Controlled by the peer-checked state of the checkbox above) */}
        <div className="hidden peer-checked:flex absolute top-full left-0 w-full bg-[#1E293B] border-b border-slate-700 shadow-lg flex-col px-6 py-4 gap-4 md:hidden">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white block text-base font-medium">
                Dashboard
              </Link>
              <Link href="/outages" className="text-slate-300 hover:text-white block text-base font-medium">
                Outages
              </Link>
              <Link href="/profile" className="text-slate-300 hover:text-white block text-base font-medium">
                Profile
              </Link>
              <div className="pt-2 border-t border-slate-700">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-slate-300 hover:text-white text-base font-medium">
                Log in
              </Link>
              <Link href="/signup" className="block text-[#3B82F6] font-medium text-base">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-grow p-6 sm:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1E293B] py-6 text-center text-sm text-slate-400 border-t border-slate-700">
        <p>© 2026 GridLog App. Built for WDD 430.</p>
      </footer>
    </div>
  );
}