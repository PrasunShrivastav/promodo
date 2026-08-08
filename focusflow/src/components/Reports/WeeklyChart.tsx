import React, { useState } from 'react';
import { ReportSummary } from '../../types';

interface WeeklyChartProps {
  summary: ReportSummary;
  weeklyData: Array<{ date: string; day: string; hours: number; minutes: number }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = React.memo(({ summary, weeklyData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 0.5);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
            Weekly Focus Hours
          </h4>
          <p className="text-xs text-zinc-500">
            Total: <strong>{summary.weeklyHours} hrs</strong> • Avg: <strong>{summary.weeklyAvgMinutesPerDay} mins/day</strong>
          </p>
        </div>
        {summary.mostWorkedTask && (
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Top Task</span>
            <span className="text-xs font-bold text-rose-500 truncate max-w-[120px] block">
              {summary.mostWorkedTask.name}
            </span>
          </div>
        )}
      </div>

      {/* Pure CSS Bar Chart */}
      <div className="h-56 w-full flex flex-col justify-end">
        {/* Y-axis + Bars Container */}
        <div className="flex-1 flex items-end gap-2 px-1 relative">
          {/* Y-axis grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-t border-zinc-100 dark:border-zinc-800/60 pointer-events-none"
              style={{ bottom: `${pct * 100}%` }}
            >
              <span className="absolute -left-1 -translate-x-full -translate-y-1/2 text-[10px] text-zinc-400 font-mono">
                {(maxHours * pct).toFixed(1)}h
              </span>
            </div>
          ))}

          {/* Bars */}
          {weeklyData.map((d, i) => {
            const heightPct = maxHours > 0 ? (d.hours / maxHours) * 100 : 0;
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end relative"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 z-10 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl text-[11px] text-white whitespace-nowrap pointer-events-none">
                    <span className="font-bold text-rose-400 block">{d.day} — {d.date}</span>
                    <span className="text-zinc-300 font-mono">{d.hours} hours focus</span>
                  </div>
                )}

                {/* Bar */}
                <div
                  className="w-full rounded-t-md bg-rose-500 dark:bg-rose-500 transition-all duration-300 min-h-[2px] cursor-pointer hover:bg-rose-400"
                  style={{ height: `${Math.max(heightPct, 1)}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex gap-2 px-1 mt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-1.5">
          {weeklyData.map((d) => (
            <div key={d.date} className="flex-1 text-center text-[11px] text-zinc-400 font-medium">
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

WeeklyChart.displayName = 'WeeklyChart';
