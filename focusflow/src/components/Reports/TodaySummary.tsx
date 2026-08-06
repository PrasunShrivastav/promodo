import React from 'react';
import { ReportSummary } from '../../types';
import { StatCard } from '../common/StatCard';
import { Clock } from 'lucide-react';

interface TodaySummaryProps {
  summary: ReportSummary;
  remainingPlanned: number;
}

export const TodaySummary: React.FC<TodaySummaryProps> = React.memo(({ summary, remainingPlanned }) => {
  const focusHrs = Math.floor(summary.todayFocusMinutes / 60);
  const focusMins = summary.todayFocusMinutes % 60;

  return (
    <section aria-labelledby="today-summary-heading">
      <h3 id="today-summary-heading" className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-rose-500" />
        <span>Today's Performance</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Focus Time"
          value={`${focusHrs}h ${focusMins}m`}
          subtext="Active work sessions today"
          valueColorClass="text-rose-500"
        />
        <StatCard
          label="Break Time"
          value={`${summary.todayBreakMinutes}m`}
          subtext="Rest & recovery time"
          valueColorClass="text-emerald-500"
        />
        <StatCard
          label="Sessions Completed"
          value={summary.todayCompletedCount}
          subtext="Finished Pomodoros"
          valueColorClass="text-zinc-900 dark:text-zinc-100"
        />
        <StatCard
          label="Remaining Planned"
          value={remainingPlanned}
          subtext="Unfinished target pomodoros"
          valueColorClass="text-sky-500"
        />
      </div>
    </section>
  );
});

TodaySummary.displayName = 'TodaySummary';
