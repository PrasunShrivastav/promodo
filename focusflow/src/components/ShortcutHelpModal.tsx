import React from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { Keyboard, X } from 'lucide-react';

export const ShortcutHelpModal: React.FC = () => {
  const { isShortcutModalOpen, setShortcutModalOpen } = usePomodoroStore();

  if (!isShortcutModalOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start / Pause / Resume timer' },
    { key: 'Shift + S', desc: 'Skip current phase (Work ↔ Break)' },
    { key: 'Shift + R', desc: 'Reset current timer phase' },
    { key: 'Escape', desc: 'Stop active timer or dismiss ringing alarm' },
    { key: 'Cmd / Ctrl + K', desc: 'Open Raycast Command Palette' },
    { key: '?', desc: 'Toggle keyboard shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setShortcutModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono font-bold text-[11px] shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setShortcutModalOpen(false)}
            className="w-full py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
