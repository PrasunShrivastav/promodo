import React from 'react';
import { ReportSummary } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyChartProps {
  summary: ReportSummary;
  monthlyData: Array<{ date: string; hours: number }>;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = React.memo(({ summary, monthlyData }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
            30-Day Focus Trend
          </h4>
          <p className="text-xs text-zinc-500">
            Total: <strong>{summary.monthlyHours} hrs</strong>
          </p>
        </div>
        {summary.bestDay && (
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Best Day</span>
            <span className="text-xs font-mono font-bold text-emerald-500 block">
              {summary.bestDay.date} ({summary.bestDay.hours}h)
            </span>
          </div>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} interval={4} />
            <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} unit="h" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(val: any) => [`${val} hours`, 'Focus Time']}
            />
            <Area type="monotone" dataKey="hours" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#focusGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

MonthlyChart.displayName = 'MonthlyChart';
