import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  valueColorClass?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  label,
  value,
  subtext,
  icon,
  valueColorClass = 'text-zinc-900 dark:text-zinc-100',
  className = ''
}) => {
  return (
    <div className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-shadow hover:shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs text-zinc-500 font-medium block">{label}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <div className={`text-2xl font-extrabold font-mono ${valueColorClass}`}>
        {value}
      </div>
      {subtext && <span className="text-[10px] text-zinc-400 mt-1 block">{subtext}</span>}
    </div>
  );
});

StatCard.displayName = 'StatCard';
