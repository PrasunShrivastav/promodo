import React from 'react';
import { Preset } from '../../types';
import { Sliders } from 'lucide-react';

interface TimerSettingsProps {
  presets: Preset[];
  activePresetId: string;
  onUpdatePreset: (presetId: string, field: keyof Preset, value: any) => void;
}

export const TimerSettings: React.FC<TimerSettingsProps> = React.memo(({
  presets,
  activePresetId,
  onUpdatePreset
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
      <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-rose-500" />
        <span>Timer Presets Configuration</span>
      </h3>

      <div className="space-y-4">
        {presets.map((preset) => (
          <div key={preset.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{preset.name}</span>
              {activePresetId === preset.id && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20">
                  ACTIVE PRESET
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-zinc-500 block text-[10px] font-semibold">Work (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={preset.workDuration}
                  onChange={(e) => onUpdatePreset(preset.id, 'workDuration', parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block text-[10px] font-semibold">Short Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={preset.shortBreakDuration}
                  onChange={(e) => onUpdatePreset(preset.id, 'shortBreakDuration', parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block text-[10px] font-semibold">Long Break (mins)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={preset.longBreakDuration}
                  onChange={(e) => onUpdatePreset(preset.id, 'longBreakDuration', parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="text-zinc-500 block text-[10px] font-semibold">Long Break Interval</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={preset.sessionsBeforeLongBreak}
                  onChange={(e) => onUpdatePreset(preset.id, 'sessionsBeforeLongBreak', parseInt(e.target.value) || 1)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preset.autoStartWork}
                  onChange={(e) => onUpdatePreset(preset.id, 'autoStartWork', e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span>Auto-start Work</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preset.autoStartBreaks}
                  onChange={(e) => onUpdatePreset(preset.id, 'autoStartBreaks', e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span>Auto-start Breaks</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

TimerSettings.displayName = 'TimerSettings';
