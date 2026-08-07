import React, { useMemo } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Target, Sparkles, Coffee } from 'lucide-react';

export const TimerRing: React.FC = React.memo(() => {
  const sessionType = usePomodoroStore(state => state.timer.sessionType);
  const durationSeconds = usePomodoroStore(state => state.timer.durationSeconds);
  const currentCycle = usePomodoroStore(state => state.timer.currentCycle);
  const activeTaskId = usePomodoroStore(state => state.timer.activeTaskId);
  const isRunning = usePomodoroStore(state => state.timer.isRunning);
  const tasks = usePomodoroStore(state => state.tasks);
  const settings = usePomodoroStore(state => state.settings);
  const remainingSeconds = usePomodoroStore(state => state.remainingSeconds);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage (0 to 1)
  const currentElapsed = durationSeconds - remainingSeconds;
  const progress = durationSeconds > 0 ? (currentElapsed / durationSeconds) : 0;
  const strokeDashoffset = 283 * (1 - Math.min(1, Math.max(0, progress)));

  // Active task details
  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeTaskId) || tasks.find(t => !t.archived) || null;
  }, [tasks, activeTaskId]);

  // Preset info
  const activePreset = useMemo(() => {
    return settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];
  }, [settings.presets, settings.activePresetId]);

  // Stroke color per session type
  const strokeColors: Record<string, string> = {
    work: 'stroke-rose-500 dark:stroke-rose-400',
    shortBreak: 'stroke-emerald-500 dark:stroke-emerald-400',
    longBreak: 'stroke-sky-500 dark:stroke-sky-400'
  };

  // Static glow class per session type (CSS-only, no animation)
  const glowClass = isRunning ? `timer-glow-${sessionType}` : '';

  const sessionBadge: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
    work: { label: 'Focus Time', icon: <Target className="w-3.5 h-3.5 text-rose-500" />, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    shortBreak: { label: 'Short Break', icon: <Coffee className="w-3.5 h-3.5 text-emerald-500" />, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    longBreak: { label: 'Long Break', icon: <Sparkles className="w-3.5 h-3.5 text-sky-500" />, bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' }
  };

  const currentBadge = sessionBadge[sessionType];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Session Type Badge */}
      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-xs mb-6 ${currentBadge.bg}`}>
        {currentBadge.icon}
        <span>{currentBadge.label}</span>
      </div>

      {/* SVG Countdown Ring — static glow, no animations */}
      <div className={`relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center rounded-full transition-shadow duration-500 ${glowClass}`}>
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Ring Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-zinc-200 dark:stroke-zinc-800/80 fill-none"
            strokeWidth="4"
          />
          {/* Active Progress Ring — no CSS transition, JS drives updates */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`fill-none ${strokeColors[sessionType]}`}
            strokeWidth="4"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Countdown & Active Task Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-xs">
            {formattedTime}
          </div>

          {/* Active Task Selector Pill */}
          <div className="mt-4 max-w-[200px]">
            {activeTask ? (
              <div 
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate cursor-pointer hover:border-zinc-400 transition-colors"
                title="Active Task (Click Tasks tab to change)"
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: activeTask.color || '#f43f5e' }}
                />
                <span className="truncate">{activeTask.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
                </span>
              </div>
            ) : (
              <div className="text-xs text-zinc-400 italic">No task selected</div>
            )}
          </div>
        </div>
      </div>

      {/* Session Cycle Dots */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium mr-1">
          Session {currentCycle} of {activePreset.sessionsBeforeLongBreak}
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: activePreset.sessionsBeforeLongBreak }).map((_, i) => {
            const isCompleted = i < currentCycle - 1;
            const isCurrent = i === currentCycle - 1;
            return (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  isCompleted
                    ? 'w-6 bg-rose-500 dark:bg-rose-400'
                    : isCurrent
                      ? 'w-4 bg-rose-500 dark:bg-rose-400 ring-2 ring-rose-500/30'
                      : 'w-2 bg-zinc-300 dark:bg-zinc-800'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

TimerRing.displayName = 'TimerRing';
