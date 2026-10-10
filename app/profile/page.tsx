import React from 'react';
import Link from 'next/link';

import { auth } from '@/auth'; 
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login'); // Ajusta la ruta a tu página de inicio de sesión
  }

  const { name, email, image } = session.user;
  
  const initials = name 
    ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your account settings and notification preferences.</p>
      </div>

      <div className="bg-[#1E293B] rounded-xl p-6 md:p-8 border border-slate-700 shadow-sm flex flex-col gap-8">
        
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-700">
          {image ? (
            <img src={image} alt={name || 'Profile'} className="w-20 h-20 rounded-full border border-slate-600 shadow-inner" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#3B82F6] flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-white">{name || 'User'}</h2>
            <p className="text-slate-400 mt-1">Frontend Developer</p>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form className="flex flex-col gap-6">
          <h3 className="text-lg font-medium text-slate-200">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                Full Name
              </label>
              {}
              <input 
                type="text" 
                id="fullName"
                name="fullName"
                defaultValue={name || ''} 
                className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              {}
              <input 
                type="email" 
                id="email"
                defaultValue={email || ''} 
                disabled
                className="bg-[#0F172A]/50 border border-slate-700 text-slate-400 text-sm rounded-lg block w-full p-3 cursor-not-allowed" 
              />
              <span className="text-xs text-slate-500">Email cannot be changed right now.</span>
            </div>
          </div>
          
          {/* System Preferences... (El resto del código se mantiene igual) */}
          <h3 className="text-lg font-medium text-slate-200 mt-2 border-t border-slate-700 pt-6">
            System Preferences
          </h3>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 bg-[#0F172A] p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-[#3B82F6] bg-slate-800 border-slate-500 rounded focus:ring-[#3B82F6]" 
              />
              <span className="text-sm text-slate-300">Receive email alerts for new power outages</span>
            </label>

            <label className="flex items-center gap-3 bg-[#0F172A] p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
              <input 
                type="checkbox" 
                defaultChecked 
                className="w-4 h-4 text-[#3B82F6] bg-slate-800 border-slate-500 rounded focus:ring-[#3B82F6]" 
              />
              <span className="text-sm text-slate-300">Show high-priority charging guidance on Dashboard</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-4 pt-6 border-t border-slate-700">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-sm font-medium text-slate-300 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-center"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}