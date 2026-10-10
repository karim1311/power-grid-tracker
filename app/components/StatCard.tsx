import React from 'react';

// Using TypeScript to define the component's props (Week 02 concept)
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  higherIsBetter?: boolean; // default false: up = red (e.g. more outages)
}

export const StatCard = ({ title, value, description, trend, trendValue, higherIsBetter = false }: StatCardProps) => {
  const getTrendColor = () => {
    if (trend === 'neutral' || !trend) return 'text-slate-400';
    const good = higherIsBetter ? trend === 'up' : trend === 'down';
    return good ? 'text-green-400' : 'text-red-400';
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