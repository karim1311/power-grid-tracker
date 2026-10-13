import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from '../auth/sign-out-button';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS } from './navLinks';

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
            <Link href="/" className="text-2xl font-bold text-[#3B82F6] hover:text-blue-400 transition-colors">
              GridLog
            </Link>
          </div>

          {/* Desktop Navigation (hidden on mobile) */}
          {isLoggedIn && (
            <nav className="hidden md:flex gap-6">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[#3B82F6] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-4">
            {/* Desktop auth buttons */}
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

            {/* Mobile hamburger + dropdown (client component) */}
            <MobileMenu isLoggedIn={isLoggedIn} />
          </div>
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