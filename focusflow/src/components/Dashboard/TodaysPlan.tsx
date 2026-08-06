import React from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Target, Play, CheckCircle2, Plus, Sparkles } from 'lucide-react';

export const TodaysPlan: React.FC = React.memo(() => {
  const tasks = usePomodoroStore(state => state.tasks);
  const activeTaskId = usePomodoroStore(state => state.activeTaskId);
  const setActiveTaskId = usePomodoroStore(state => state.setActiveTaskId);
  const startTimer = usePomodoroStore(state => state.startTimer);
  const isRunning = usePomodoroStore(state => state.timer.isRunning);
  const setActiveTab = usePomodoroStore(state => state.setActiveTab);
  const templates = usePomodoroStore(state => state.templates);
  const applyTemplateToToday = usePomodoroStore(state => state.applyTemplateToToday);

  const activeTasks = tasks.filter(t => !t.archived);

  const totalPlanned = activeTasks.reduce((acc, t) => acc + t.estimatedPomodoros, 0);
  const totalCompleted = activeTasks.reduce((acc, t) => acc + t.completedPomodoros, 0);
  const overallPercent = totalPlanned > 0 ? Math.min(100, Math.round((totalCompleted / totalPlanned) * 100)) : 0;

  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5" aria-label="Today Workload Plan">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Today's Workload Plan
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track your target Pomodoro completion instead of just tracking hours.
          </p>
        </div>

        {/* Overall Pomodoro Progress pill */}
        <div className="flex items-center gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <div className="text-right">
            <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-zinc-100 block">
              {totalCompleted} / {totalPlanned} Pomodoros
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block">
              {overallPercent}% Workload Finished
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-mono font-extrabold text-xs text-rose-500">
            {overallPercent}%
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {totalPlanned > 0 && (
        <div className="space-y-1.5">
          <div 
            className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5"
            role="progressbar"
            aria-valuenow={overallPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Workload List with Visual Pomodoro Dots */}
      {activeTasks.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
          <p className="text-xs text-zinc-400 font-medium">No active tasks planned for today yet.</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
            {templates.length > 0 && (
              <button
                onClick={() => applyTemplateToToday(templates[0].id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import "{templates[0].name}"</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTasks.map((task) => {
            const isSelectedActive = activeTaskId === task.id;
            const isTaskDone = task.completedPomodoros >= task.estimatedPomodoros;

            return (
              <div 
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelectedActive
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/40 shadow-xs'
                    : isTaskDone
                      ? 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-75'
                      : 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Task Meta */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: task.color || '#f43f5e' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-extrabold truncate ${isTaskDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {task.name}
                        </h4>
                        {isSelectedActive && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-bold tracking-wider uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Ratio */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {task.completedPomodoros} / {task.estimatedPomodoros}
                    </span>

                    {!isSelectedActive && !isTaskDone && (
                      <button
                        onClick={() => setActiveTaskId(task.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white text-zinc-800 dark:text-zinc-200 font-bold text-[11px] transition-colors"
                      >
                        Set Active
                      </button>
                    )}

                    {isSelectedActive && !isRunning && !isTaskDone && (
                      <button
                        onClick={startTimer}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start</span>
                      </button>
                    )}

                    {isTaskDone && (
                      <span className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Pomodoro Visual Dots Sequence */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {Array.from({ length: Math.max(task.estimatedPomodoros, task.completedPomodoros) }).map((_, i) => {
                    const isCompleted = i < task.completedPomodoros;
                    return (
                      <span
                        key={i}
                        title={isCompleted ? `Pomodoro ${i + 1} completed` : `Pomodoro ${i + 1} remaining`}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-transform ${
                          isCompleted
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 shadow-2xs'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 border border-zinc-200 dark:border-zinc-700/60'
                        }`}
                      >
                        {isCompleted ? '🍅' : '⬜'}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

TodaysPlan.displayName = 'TodaysPlan';
