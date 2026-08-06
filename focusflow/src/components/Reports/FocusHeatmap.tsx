import React, { useState, useMemo } from 'react';
import { SessionRecord } from '../../types';
import { getTodayDateString } from '../../utils/analytics';
import { Calendar, Flame } from 'lucide-react';

interface FocusHeatmapProps {
  sessions: SessionRecord[];
}

export const FocusHeatmap: React.FC<FocusHeatmapProps> = React.memo(({ sessions }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Compute daily stats map
  const dailyStatsMap = useMemo(() => {
    const map: Record<string, { minutes: number; sessionsCount: number }> = {};
    sessions.forEach(s => {
      if (s.completed && s.sessionType === 'work') {
        if (!map[s.date]) {
          map[s.date] = { minutes: 0, sessionsCount: 0 };
        }
        map[s.date].minutes += s.durationMinutes;
        map[s.date].sessionsCount += 1;
      }
    });
    return map;
  }, [sessions]);

  // Generate grid days depending on view mode
  const gridDays = useMemo(() => {
    const totalDays = viewMode === 'monthly' ? 35 : 365; // 5 weeks or full year (~52 weeks)
    const daysArr = [];
    const today = new Date();

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getTodayDateString(d);
      const stats = dailyStatsMap[dateStr] || { minutes: 0, sessionsCount: 0 };

      daysArr.push({
        date: dateStr,
        formattedDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        minutes: stats.minutes,
        sessionsCount: stats.sessionsCount,
        dayOfWeek: d.getDay(),
      });
    }

    return daysArr;
  }, [viewMode, dailyStatsMap]);

  // Get color intensity level based on focus minutes
  const getColorClass = (minutes: number) => {
    if (minutes === 0) return 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200/60 dark:border-zinc-700/40';
    if (minutes <= 25) return 'bg-rose-200 dark:bg-rose-950/80 border-rose-300 dark:border-rose-900';
    if (minutes <= 60) return 'bg-rose-400 dark:bg-rose-800 border-rose-500 dark:border-rose-700';
    if (minutes <= 120) return 'bg-rose-500 dark:bg-rose-600 border-rose-600 dark:border-rose-500';
    return 'bg-rose-600 dark:bg-rose-500 border-rose-700 dark:border-rose-400';
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>Focus Activity Heatmap</span>
          </h4>
          <p className="text-xs text-zinc-500">
            Visual intensity map of your focus sessions over time.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white dark:bg-zinc-900 text-rose-500 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Monthly (35 Days)
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              viewMode === 'yearly'
                ? 'bg-white dark:bg-zinc-900 text-rose-500 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Yearly (1 Year)
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max space-y-2">
          {/* Day Labels (Mon, Wed, Fri) */}
          <div className="flex text-[10px] text-zinc-400 font-mono pl-6 gap-8">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div className="flex items-start gap-1">
            {/* Render items in a wrapped calendar grid */}
            <div 
              className={`grid gap-1.5 ${
                viewMode === 'monthly' ? 'grid-rows-7 grid-flow-col' : 'grid-rows-7 grid-flow-col'
              }`}
            >
              {gridDays.map((day) => {
                const hrs = Math.floor(day.minutes / 60);
                const mins = day.minutes % 60;
                const timeText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

                return (
                  <div
                    key={day.date}
                    tabIndex={0}
                    className={`group relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border transition-transform hover:scale-125 focus:scale-125 focus:outline-none ${getColorClass(day.minutes)}`}
                    aria-label={`${day.formattedDate}: ${timeText} focus, ${day.sessionsCount} sessions`}
                  >
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex group-focus:flex flex-col z-30 pointer-events-none min-w-[130px] p-2 bg-zinc-900 text-zinc-100 border border-zinc-700 text-[11px] rounded-xl shadow-xl space-y-0.5">
                      <span className="font-bold text-rose-400 block">{day.formattedDate}</span>
                      <span className="text-zinc-300 font-mono block">Focus: {timeText}</span>
                      <span className="text-zinc-400 text-[10px] block">{day.sessionsCount} completed session{day.sessionsCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span>Less</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-2xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" title="0 mins" />
          <span className="w-3 h-3 rounded-2xs bg-rose-200 dark:bg-rose-950 border border-rose-300" title="1-25 mins" />
          <span className="w-3 h-3 rounded-2xs bg-rose-400 dark:bg-rose-800 border border-rose-500" title="26-60 mins" />
          <span className="w-3 h-3 rounded-2xs bg-rose-500 dark:bg-rose-600 border border-rose-600" title="61-120 mins" />
          <span className="w-3 h-3 rounded-2xs bg-rose-600 dark:bg-rose-500 border border-rose-700" title="120+ mins" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
});

FocusHeatmap.displayName = 'FocusHeatmap';
