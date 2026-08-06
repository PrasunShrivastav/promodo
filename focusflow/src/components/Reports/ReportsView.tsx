import React, { useMemo } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { 
  generateReportSummary, 
  getWeeklyChartData, 
  getMonthlyTrendData 
} from '../../utils/analytics';
import { TodaySummary } from './TodaySummary';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';
import { LifetimeStats } from './LifetimeStats';
import { TaskAnalytics } from './TaskAnalytics';
import { FocusHeatmap } from './FocusHeatmap';
import { BarChart3, Flame } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const sessions = usePomodoroStore(state => state.sessions);
  const tasks = usePomodoroStore(state => state.tasks);

  // Memoize all expensive calculations so they re-calculate ONLY when sessions or tasks array changes
  const summary = useMemo(() => generateReportSummary(sessions, tasks), [sessions, tasks]);
  const weeklyData = useMemo(() => getWeeklyChartData(sessions), [sessions]);
  const monthlyData = useMemo(() => getMonthlyTrendData(sessions), [sessions]);

  const remainingPlanned = useMemo(() => {
    const totalPlanned = tasks.filter(t => !t.archived).reduce((acc, t) => acc + t.estimatedPomodoros, 0);
    const totalCompleted = tasks.filter(t => !t.archived).reduce((acc, t) => acc + t.completedPomodoros, 0);
    return Math.max(0, totalPlanned - totalCompleted);
  }, [tasks]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Productivity Analytics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Performance Reports & Insights
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deep insights into your focus hours, habits, streaks, and task velocity.
          </p>
        </div>

        {/* Streak summary pill */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          <div>
            <span className="text-xs text-zinc-500 block leading-tight">Streak</span>
            <span className="font-mono font-bold text-base">{summary.currentStreak} Days Current (Best: {summary.longestStreak}d)</span>
          </div>
        </div>
      </div>

      {/* TODAY SUMMARY */}
      <TodaySummary summary={summary} remainingPlanned={remainingPlanned} />

      {/* FOCUS HEATMAP */}
      <FocusHeatmap sessions={sessions} />

      {/* WEEKLY & MONTHLY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart summary={summary} weeklyData={weeklyData} />
        <MonthlyChart summary={summary} monthlyData={monthlyData} />
      </div>

      {/* LIFETIME METRICS */}
      <LifetimeStats summary={summary} />

      {/* TASK ANALYTICS */}
      <TaskAnalytics tasks={tasks} sessions={sessions} />
    </div>
  );
};
