import React from 'react';
import { ReportSummary } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyChartProps {
  summary: ReportSummary;
  weeklyData: Array<{ date: string; day: string; hours: number; minutes: number }>;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = React.memo(({ summary, weeklyData }) => {
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

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} unit="h" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(val: any) => [`${val} hours`, 'Focus Time']}
            />
            <Bar dataKey="hours" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

WeeklyChart.displayName = 'WeeklyChart';
