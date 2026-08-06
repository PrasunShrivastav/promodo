import React, { useState, useEffect } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Target, Sparkles, Coffee } from 'lucide-react';

export const TimerRing: React.FC = () => {
  const timer = usePomodoroStore(state => state.timer);
  const tasks = usePomodoroStore(state => state.tasks);
  const settings = usePomodoroStore(state => state.settings);

  // Local 1-second tick state so only TimerRing re-renders on every second while running
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning]);

  // Calculate elapsed and remaining seconds
  const currentElapsed = timer.elapsedBeforePause + (timer.isRunning && timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0);
  const remainingSeconds = Math.max(0, timer.durationSeconds - currentElapsed);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage (1 to 0 or 0 to 1)
  const progress = timer.durationSeconds > 0 ? (currentElapsed / timer.durationSeconds) : 0;
  const strokeDashoffset = 283 * (1 - Math.min(1, Math.max(0, progress)));

  // Active task details
  const activeTask = tasks.find(t => t.id === timer.activeTaskId) || tasks.find(t => !t.archived) || null;

  // Preset info
  const activePreset = settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];

  // Theme accent stroke color
  const sessionColors = {
    work: 'text-rose-500 stroke-rose-500 dark:stroke-rose-400',
    shortBreak: 'text-emerald-500 stroke-emerald-500 dark:stroke-emerald-400',
    longBreak: 'text-sky-500 stroke-sky-500 dark:stroke-sky-400'
  };

  const sessionBadge = {
    work: { label: 'Focus Time', icon: <Target className="w-3.5 h-3.5 text-rose-500" />, bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
    shortBreak: { label: 'Short Break', icon: <Coffee className="w-3.5 h-3.5 text-emerald-500" />, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    longBreak: { label: 'Long Break', icon: <Sparkles className="w-3.5 h-3.5 text-sky-500" />, bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' }
  };

  const currentBadge = sessionBadge[timer.sessionType];

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Session Type Badge */}
      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-xs mb-6 ${currentBadge.bg}`}>
        {currentBadge.icon}
        <span>{currentBadge.label}</span>
      </div>

      {/* SVG Countdown Ring */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Ring Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-zinc-200 dark:stroke-zinc-800/80 fill-none"
            strokeWidth="4"
          />
          {/* Animated Active Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className={`fill-none transition-all duration-500 ease-linear ${sessionColors[timer.sessionType]}`}
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
          Session {timer.currentCycle} of {activePreset.sessionsBeforeLongBreak}
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: activePreset.sessionsBeforeLongBreak }).map((_, i) => {
            const isCompleted = i < timer.currentCycle - 1;
            const isCurrent = i === timer.currentCycle - 1;
            return (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  isCompleted
                    ? 'w-6 bg-rose-500 dark:bg-rose-400'
                    : isCurrent
                      ? 'w-4 bg-rose-400/80 dark:bg-rose-500/80 animate-pulse'
                      : 'w-2 bg-zinc-300 dark:bg-zinc-800'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
