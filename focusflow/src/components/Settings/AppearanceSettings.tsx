import React from 'react';
import { UserSettings } from '../../types';
import { Moon, Sun, Sparkles } from 'lucide-react';

interface AppearanceSettingsProps {
  theme: UserSettings['theme'];
  onUpdateTheme: (theme: UserSettings['theme']) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = React.memo(({ theme, onUpdateTheme }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Moon className="w-4 h-4 text-rose-500" />
        <span>Appearance & Theme</span>
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {(['dark', 'light', 'system'] as const).map((t) => {
          const isActive = theme === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onUpdateTheme(t)}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold capitalize flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                isActive
                  ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {t === 'dark' ? <Moon className="w-3.5 h-3.5" /> : t === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{t}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

AppearanceSettings.displayName = 'AppearanceSettings';
