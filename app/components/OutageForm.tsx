import React from 'react';
import Link from 'next/link';

export const OutageForm = () => {
  // Note: Server Actions for Data Mutation (Week 04) will be connected here later.

  return (
    <form className="bg-[#1E293B] p-6 sm:p-8 rounded-xl border border-slate-700 shadow-sm flex flex-col gap-6 max-w-2xl mx-auto w-full">
      
      {/* Form Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Log Power Outage</h2>
        <p className="text-sm text-slate-400">Enter the details of the grid failure below.</p>
      </div>

      {/* Location Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="text-sm font-medium text-slate-300">
          Location
        </label>
        <select
          id="location"
          name="locationId"
          className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors"
          required
        >
          <option value="">Select a monitored location...</option>
          <option value="1">Downtown Sector A</option>
          <option value="2">North Hills Residential</option>
          <option value="3">Westside Industrial Park</option>
        </select>
      </div>

      {/* Date and Time Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="startTime" className="text-sm font-medium text-slate-300">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors text-slate-300"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="endTime" className="text-sm font-medium text-slate-300">
            End Time <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            className="bg-[#0F172A] border border-slate-600 text-white text-sm rounded-lg focus:ring-[#3B82F6] focus:border-[#3B82F6] block w-full p-3 transition-colors text-slate-300"
          />
          <span className="text-xs text-slate-500">Leave blank if the outage is currently ongoing.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-4 pt-6 border-t border-slate-700">
        <Link
          href="/outages"
          className="px-6 py-2.5 text-sm font-medium text-slate-300 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
        >
          Save Record
        </button>
      </div>
      
    </form>
  );
};