import React from 'react';
import { OutageForm } from '../../components/OutageForm';
import Link from 'next/link';

export default function NewOutagePage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Back navigation */}
      <Link 
        href="/outages" 
        className="text-[#3B82F6] hover:text-blue-400 text-sm font-medium flex items-center gap-2 transition-colors w-fit"
      >
        <span aria-hidden="true">←</span>
        Back to Outages
      </Link>
      
      {/* Render the form component */}
      <OutageForm />
    </div>
  );
}