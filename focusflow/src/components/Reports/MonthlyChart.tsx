import React, { useState, useMemo } from 'react';
import { ReportSummary } from '../../types';

interface MonthlyChartProps {
  summary: ReportSummary;
  monthlyData: Array<{ date: string; hours: number }>;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = React.memo(({ summary, monthlyData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxHours = useMemo(() => Math.max(...monthlyData.map(d => d.hours), 0.5), [monthlyData]);

  // Generate SVG polyline points for the area chart
  const { linePoints, areaPoints } = useMemo(() => {
    const width = 600;
    const height = 200;
    const padding = 4;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;

    const pts = monthlyData.map((d, i) => {
      const x = padding + (i / Math.max(1, monthlyData.length - 1)) * usableW;
      const y = padding + usableH - (d.hours / maxHours) * usableH;
      return { x, y };
    });

    const line = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${padding},${padding + usableH} ${line} ${padding + usableW},${padding + usableH}`;

    return { linePoints: line, areaPoints: area };
  }, [monthlyData, maxHours]);

  // X-axis labels — show every 5th
  const xLabels = useMemo(() => {
    return monthlyData.filter((_, i) => i % 5 === 0 || i === monthlyData.length - 1);
  }, [monthlyData]);

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

      {/* SVG Area Chart */}
      <div className="h-56 w-full relative">
        <svg
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="focusGradientSvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1="4"
              y1={4 + 192 * (1 - pct)}
              x2="596"
              y2={4 + 192 * (1 - pct)}
              className="stroke-zinc-100 dark:stroke-zinc-800/60"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#focusGradientSvg)"
          />

          {/* Line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Hover hit areas — invisible wide bars for each data point */}
          {monthlyData.map((d, i) => {
            const x = 4 + (i / Math.max(1, monthlyData.length - 1)) * 592;
            const barWidth = 592 / monthlyData.length;
            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={0}
                width={barWidth}
                height={200}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'crosshair' }}
              />
            );
          })}

          {/* Hover dot */}
          {hoveredIndex !== null && (() => {
            const d = monthlyData[hoveredIndex];
            const x = 4 + (hoveredIndex / Math.max(1, monthlyData.length - 1)) * 592;
            const y = 4 + 192 - (d.hours / maxHours) * 192;
            return (
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#f43f5e"
                stroke="white"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })()}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && (() => {
          const d = monthlyData[hoveredIndex];
          const leftPct = (hoveredIndex / Math.max(1, monthlyData.length - 1)) * 100;
          return (
            <div
              className="absolute top-0 z-10 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl text-[11px] text-white whitespace-nowrap pointer-events-none -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
            >
              <span className="font-bold text-rose-400 block">{d.date}</span>
              <span className="text-zinc-300 font-mono">{d.hours} hours focus</span>
            </div>
          );
        })()}

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none py-1">
          {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
            <span key={pct} className="text-[10px] text-zinc-400 font-mono -translate-x-1">
              {(maxHours * pct).toFixed(1)}h
            </span>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-1 mt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-1.5">
        {xLabels.map((d) => (
          <span key={d.date} className="text-[10px] text-zinc-400 font-mono">
            {d.date}
          </span>
        ))}
      </div>
    </div>
  );
});

MonthlyChart.displayName = 'MonthlyChart';
