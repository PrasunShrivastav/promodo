import React from 'react';
import { ReportSummary } from '../../types';
import { StatCard } from '../common/StatCard';
import { Trophy } from 'lucide-react';

interface LifetimeStatsProps {
  summary: ReportSummary;
}

export const LifetimeStats: React.FC<LifetimeStatsProps> = React.memo(({ summary }) => {
  return (
    <section aria-labelledby="lifetime-stats-heading">
      <h3 id="lifetime-stats-heading" className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span>Lifetime Achievement</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Focus Hours" value={`${summary.lifetimeHours}h`} />
        <StatCard label="Total Sessions" value={summary.lifetimeSessions} />
        <StatCard label="Avg Session Length" value={`${summary.lifetimeAvgSessionMinutes}m`} />
        <StatCard label="Longest Streak" value={`${summary.longestStreak} Days`} valueColorClass="text-amber-500" />
      </div>
    </section>
  );
});

LifetimeStats.displayName = 'LifetimeStats';
