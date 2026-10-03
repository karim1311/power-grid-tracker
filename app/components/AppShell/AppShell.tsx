import React from 'react';
import Link from 'next/link';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-white font-sans">
      {/* Main Header */}
      <header className="bg-[#1E293B] px-6 py-4 border-b border-slate-700 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          {/* Logo / Brand */}
          <span className="text-2xl font-bold text-[#3B82F6]">GridLog</span>
        </div>
        
        {/* Navigation - Week 02 */}
        <nav className="hidden md:flex gap-6">
          <Link href="/dashboard" className="hover:text-[#3B82F6] transition-colors">Dashboard</Link>
          <Link href="/outages" className="hover:text-[#3B82F6] transition-colors">Outages</Link>
          <Link href="/profile" className="hover:text-[#3B82F6] transition-colors">Profile</Link>
        </nav>
        
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 rounded text-sm font-medium hover:bg-slate-700 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded text-sm font-medium bg-[#3B82F6] hover:bg-blue-600 transition-colors">
            Sign up
          </Link>
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