import React from 'react';
import { UserSettings, AlarmSound } from '../../types';
import { Volume2, Play, Bell } from 'lucide-react';

interface NotificationSettingsProps {
  alarmSound: AlarmSound;
  alarmVolume: number;
  notificationStatus: string;
  onUpdateSound: (sound: AlarmSound) => void;
  onUpdateVolume: (vol: number) => void;
  onTestSound: () => void;
  onRequestNotification: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = React.memo(({
  alarmSound,
  alarmVolume,
  notificationStatus,
  onUpdateSound,
  onUpdateVolume,
  onTestSound,
  onRequestNotification
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
      <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-rose-500" />
        <span>Audio & Desktop Alarm</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Alarm Sound Selector */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            Alarm Chime Sound
          </label>
          <div className="flex items-center gap-2">
            <select
              value={alarmSound}
              onChange={(e) => onUpdateSound(e.target.value as AlarmSound)}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="zen">Zen Gong (Warm Resonant Bowl)</option>
              <option value="digital">Digital Beep (Classic Clock)</option>
              <option value="marimba">Marimba Arpeggio (Soft Melody)</option>
              <option value="bell">Soft Crisp Bell</option>
            </select>
            <button
              type="button"
              onClick={onTestSound}
              title="Play test audio note"
              className="p-2 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-rose-600 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test</span>
            </button>
          </div>
        </div>

        {/* Alarm Volume Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Alarm Volume
            </label>
            <span className="text-xs font-mono font-bold text-zinc-500">
              {Math.round(alarmVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={alarmVolume}
            onChange={(e) => onUpdateVolume(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Desktop Notification Request */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div>
          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
            Desktop Alarm Notifications
          </span>
          <span className="text-[11px] text-zinc-500 block">
            Status: <strong className="capitalize">{notificationStatus}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={onRequestNotification}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Enable Notifications</span>
        </button>
      </div>
    </div>
  );
});

NotificationSettings.displayName = 'NotificationSettings';
