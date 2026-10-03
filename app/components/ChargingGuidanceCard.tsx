import React from 'react';

// Defining props with TypeScript (Week 02)
interface ChargingGuidanceProps {
  recommendedWindow: string;
  estimatedNextOutage: string;
  actionPriority: 'High' | 'Medium' | 'Low';
}

export const ChargingGuidanceCard = ({ 
  recommendedWindow, 
  estimatedNextOutage, 
  actionPriority 
}: ChargingGuidanceProps) => {
  
  // Dynamic styling based on priority
  const getPriorityColors = () => {
    switch (actionPriority) {
      case 'High':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Medium':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Low':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className={`p-6 rounded-xl border flex flex-col gap-4 shadow-sm ${getPriorityColors()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Charging Guidance</h3>
          <p className="text-sm opacity-80">Optimize your backup power readiness.</p>
        </div>
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border border-current">
          {actionPriority} Priority
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="bg-[#0F172A]/50 p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Recommended Window</p>
          <p className="text-xl font-semibold text-white">{recommendedWindow}</p>
        </div>
        <div className="bg-[#0F172A]/50 p-4 rounded-lg">
          <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Next Est. Outage</p>
          <p className="text-xl font-semibold text-white">{estimatedNextOutage}</p>
        </div>
      </div>
      
      <p className="text-sm opacity-90 mt-2">
        Plug in your power stations and UPS units during the recommended window to ensure 100% capacity.
      </p>
    </div>
  );
};