import React from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Play, Pause, SkipForward, Maximize2 } from 'lucide-react';

export const MiniFloatingTimer: React.FC = () => {
  const { 
    timer, 
    activeTab, 
    setActiveTab, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    skipPhase,
    tasks 
  } = usePomodoroStore();

  // Hide when on dashboard tab or when timer hasn't been used
  if (activeTab === 'dashboard') return null;

  const currentElapsed = timer.elapsedBeforePause + (timer.isRunning && timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0);
  const remainingSeconds = Math.max(0, timer.durationSeconds - currentElapsed);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const activeTask = tasks.find(t => t.id === timer.activeTaskId);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800/90 shadow-2xl rounded-2xl p-2.5 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Clickable Timer Badge */}
      <button 
        onClick={() => setActiveTab('dashboard')} 
        className="flex items-center gap-3 text-left group hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-mono font-bold text-sm">
          {formattedTime}
        </div>
        <div className="hidden sm:block max-w-[130px]">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
            {activeTask?.name || 'General Focus'}
          </span>
          <span className="text-[10px] text-zinc-500 capitalize">
            {timer.sessionType === 'work' ? 'Focusing' : 'Break'} • {timer.isRunning ? 'Running' : 'Paused'}
          </span>
        </div>
      </button>

      <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

      {/* Quick Play / Pause / Skip */}
      <div className="flex items-center gap-1">
        {!timer.isRunning ? (
          <button
            onClick={timer.isPaused ? resumeTimer : startTimer}
            className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        <button
          onClick={skipPhase}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          title="Expand to Full View"
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
