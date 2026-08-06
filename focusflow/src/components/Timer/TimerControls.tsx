import React, { useEffect } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Play, Pause, SkipForward, RotateCcw, Square } from 'lucide-react';

export const TimerControls: React.FC = () => {
  const { 
    timer, 
    settings, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    skipPhase, 
    stopTimer, 
    resetTimer,
    setActivePreset,
    setCommandPaletteOpen
  } = usePomodoroStore();

  // Global Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'KeyK' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.isRunning) {
          pauseTimer();
        } else if (timer.isPaused) {
          resumeTimer();
        } else {
          startTimer();
        }
      } else if (e.shiftKey && e.code === 'KeyS') {
        e.preventDefault();
        skipPhase();
      } else if (e.shiftKey && e.code === 'KeyR') {
        e.preventDefault();
        resetTimer();
      } else if (e.code === 'Escape') {
        if (timer.isRunning || timer.isPaused) {
          e.preventDefault();
          stopTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer.isRunning, timer.isPaused, startTimer, pauseTimer, resumeTimer, skipPhase, resetTimer, stopTimer, setCommandPaletteOpen]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      
      {/* Preset Selector Buttons */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full justify-center">
        {settings.presets.map((preset) => {
          const isActive = settings.activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset.id)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          title="Reset Phase (Shift + R)"
          className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Start / Pause / Resume Button */}
        {!timer.isRunning && !timer.isPaused ? (
          <button
            onClick={startTimer}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-base shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Focus</span>
          </button>
        ) : timer.isRunning ? (
          <button
            onClick={pauseTimer}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Pause className="w-5 h-5 fill-white" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume</span>
          </button>
        )}

        {/* Skip Button */}
        <button
          onClick={skipPhase}
          title="Skip Phase (Shift + S)"
          className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-95"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Stop Button */}
        {(timer.isRunning || timer.isPaused) && (
          <button
            onClick={stopTimer}
            title="Stop Session (Esc)"
            className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-95"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>

      {/* Keyboard Hint Ribbon */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 font-mono">
        <span><kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">Space</kbd> Start/Pause</span>
        <span><kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">⇧S</kbd> Skip</span>
        <span><kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">Esc</kbd> Stop</span>
      </div>
    </div>
  );
};
