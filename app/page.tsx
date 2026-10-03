import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Hero Section */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
        Track Power Outages <span className="text-[#3B82F6]">Efficiently</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
        GridLog helps you monitor downtime, analyze reliability metrics, and plan your backup power charging windows.
      </p>
      
      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/signup" 
          className="px-8 py-3 rounded-lg font-semibold bg-[#3B82F6] text-white hover:bg-blue-600 transition-colors shadow-lg"
        >
          Get Started
        </Link>
        <Link 
          href="/login" 
          className="px-8 py-3 rounded-lg font-semibold bg-[#1E293B] text-white border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          Log In
        </Link>
      </div>

      {/* Optional: Brief feature highlights */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">Log Events</h3>
          <p className="text-slate-400 text-sm">Easily record start and end times for power outages in your area.</p>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">View Analytics</h3>
          <p className="text-slate-400 text-sm">Track daily downtime summaries and historical outage trends.</p>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">Plan Ahead</h3>
          <p className="text-slate-400 text-sm">Get charging guidance for your backup power stations.</p>
        </div>
      </div>
    </div>
  );
}