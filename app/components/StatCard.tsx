import React from 'react';

// Using TypeScript to define the component's props (Week 02 concept)
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard = ({ title, value, description, trend, trendValue }: StatCardProps) => {
  // Helper function to set trend colors based on the data
  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-400'; // Red for negative trends (e.g., more outages)
    if (trend === 'down') return 'text-green-400'; // Green for positive trends (e.g., fewer outages)
    return 'text-slate-400';
  };

  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700 shadow-sm flex flex-col gap-2">
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white">{value}</span>
        
        {/* Render trend indicator only if provided */}
        {trend && trendValue && (
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
          </span>
        )}
      </div>
      
      {/* Optional description below the metric */}
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
};