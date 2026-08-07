import React, { useMemo } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { TimerRing } from '../Timer/TimerRing';
import { TimerControls } from '../Timer/TimerControls';
import { TodaysPlan } from './TodaysPlan';
import { generateReportSummary } from '../../utils/analytics';
import { 
  Flame, 
  Target, 
  Play, 
  Coffee,
  ChevronRight
} from 'lucide-react';

export const DashboardView: React.FC = React.memo(() => {
  // Surgical subscriptions — only the fields each section needs
  const activeTaskId = usePomodoroStore(state => state.timer.activeTaskId);
  const isRunning = usePomodoroStore(state => state.timer.isRunning);
  const sessionType = usePomodoroStore(state => state.timer.sessionType);
  const currentCycle = usePomodoroStore(state => state.timer.currentCycle);
  const tasks = usePomodoroStore(state => state.tasks);
  const sessions = usePomodoroStore(state => state.sessions);
  const setActiveTab = usePomodoroStore(state => state.setActiveTab);
  const startTimer = usePomodoroStore(state => state.startTimer);
  const setActiveTaskId = usePomodoroStore(state => state.setActiveTaskId);
  const settings = usePomodoroStore(state => state.settings);

  const summary = useMemo(() => generateReportSummary(sessions, tasks), [sessions, tasks]);

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeTaskId) || tasks.find(t => !t.archived) || null;
  }, [tasks, activeTaskId]);

  const activePreset = useMemo(() => {
    return settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];
  }, [settings.presets, settings.activePresetId]);

  const remainingPlanned = useMemo(() => {
    const totalPlanned = tasks.filter(t => !t.archived).reduce((acc, t) => acc + t.estimatedPomodoros, 0);
    const totalCompleted = tasks.filter(t => !t.archived).reduce((acc, t) => acc + t.completedPomodoros, 0);
    return Math.max(0, totalPlanned - totalCompleted);
  }, [tasks]);

  const upcomingBreakMins = useMemo(() => {
    return sessionType === 'work' 
      ? (currentCycle >= activePreset.sessionsBeforeLongBreak ? activePreset.longBreakDuration : activePreset.shortBreakDuration)
      : activePreset.workDuration;
  }, [sessionType, currentCycle, activePreset]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      
      {/* QUICK STATS METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" aria-label="Quick statistics summary">
        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Today Focus</span>
          <span className="font-mono text-base font-extrabold text-rose-500 block mt-0.5">
            {Math.floor(summary.todayFocusMinutes / 60)}h {summary.todayFocusMinutes % 60}m
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Completed</span>
          <span className="font-mono text-base font-extrabold text-zinc-900 dark:text-zinc-100 block mt-0.5">
            {summary.todayCompletedCount} Sessions
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Streak</span>
          <span className="font-mono text-base font-extrabold text-amber-500 block mt-0.5 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-current" />
            {summary.currentStreak}d
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Best Streak</span>
          <span className="font-mono text-base font-extrabold text-zinc-700 dark:text-zinc-300 block mt-0.5">
            {summary.longestStreak}d
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Weekly</span>
          <span className="font-mono text-base font-extrabold text-sky-500 block mt-0.5">
            {summary.weeklyHours}h
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Monthly</span>
          <span className="font-mono text-base font-extrabold text-emerald-500 block mt-0.5">
            {summary.monthlyHours}h
          </span>
        </div>

        <div className="stat-card-premium p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Planned Left</span>
          <span className="font-mono text-base font-extrabold text-purple-500 block mt-0.5">
            {remainingPlanned} Pom
          </span>
        </div>
      </div>

      {/* MAIN TIMER HERO CENTER — Glassmorphism */}
      <section className="relative rounded-3xl timer-hero-glass p-6 sm:p-10 flex flex-col items-center justify-center" aria-label="Pomodoro Timer Section">
        
        {/* Next Phase Indicator Banner */}
        <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-semibold text-zinc-500">
          <Coffee className="w-3 h-3 text-zinc-400" />
          <span>Next: {sessionType === 'work' ? `${upcomingBreakMins}m Break` : `${upcomingBreakMins}m Focus`}</span>
        </div>

        {/* Circular Countdown Ring */}
        <TimerRing />

        {/* Controls */}
        <div className="w-full mt-2">
          <TimerControls />
        </div>
      </section>

      {/* TODAY'S WORKLOAD PLAN SECTION */}
      <TodaysPlan />

      {/* ACTIVE TASK & QUICK SELECTION SECTION */}
      <section className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4" aria-label="Active Focus Target Section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Active Focus Target
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg"
          >
            <span>Manage Tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeTask ? (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeTask.color || '#f43f5e' }} />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{activeTask.name}</h4>
              </div>
              {activeTask.notes && (
                <p className="text-xs text-zinc-500 font-mono line-clamp-1 ml-5">
                  {activeTask.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 block">
                  {activeTask.completedPomodoros} / {activeTask.estimatedPomodoros} Completed
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  {Math.round((activeTask.completedPomodoros / activeTask.estimatedPomodoros) * 100)}% progress
                </span>
              </div>

              {!isRunning && (
                <button
                  onClick={startTimer}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Now</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-300 dark:border-zinc-800 text-xs text-zinc-400">
            No active task selected. <button onClick={() => setActiveTab('tasks')} className="text-rose-500 font-bold underline">Click here to add tasks</button>
          </div>
        )}

        {/* Quick Task Switcher List */}
        {tasks.filter(t => !t.archived && t.id !== activeTask?.id).length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Other Tasks Today
            </span>
            <div className="flex flex-wrap gap-2">
              {tasks.filter(t => !t.archived && t.id !== activeTask?.id).slice(0, 5).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTaskId(t.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-rose-500/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color || '#f43f5e' }} />
                  <span className="truncate max-w-[120px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
});

DashboardView.displayName = 'DashboardView';
