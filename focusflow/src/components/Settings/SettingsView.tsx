import React, { useState, useCallback } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { playSoundNote } from '../../utils/audio';
import { requestNotificationPermission } from '../../utils/notifications';
import { AlarmSound, Preset, UserSettings } from '../../types';
import { AppearanceSettings } from './AppearanceSettings';
import { TimerSettings } from './TimerSettings';
import { NotificationSettings } from './NotificationSettings';
import { TemplateSettings } from './TemplateSettings';
import { BackupSettings } from './BackupSettings';
import { Settings as SettingsIcon } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const settings = usePomodoroStore(state => state.settings);
  const updateSettings = usePomodoroStore(state => state.updateSettings);
  const templates = usePomodoroStore(state => state.templates);

  const [notificationStatus, setNotificationStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestNotification = useCallback(async () => {
    const res = await requestNotificationPermission();
    setNotificationStatus(res);
    updateSettings({ notificationEnabled: res === 'granted' });
  }, [updateSettings]);

  const handleTestSound = useCallback(() => {
    playSoundNote(settings.alarmSound, settings.alarmVolume);
  }, [settings.alarmSound, settings.alarmVolume]);

  const handleUpdatePreset = useCallback((presetId: string, field: keyof Preset, value: any) => {
    const updatedPresets = settings.presets.map(p => {
      if (p.id === presetId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    updateSettings({ presets: updatedPresets });
  }, [settings.presets, updateSettings]);

  const handleUpdateTheme = useCallback((theme: UserSettings['theme']) => {
    updateSettings({ theme });
  }, [updateSettings]);

  const handleUpdateSound = useCallback((alarmSound: AlarmSound) => {
    updateSettings({ alarmSound });
  }, [updateSettings]);

  const handleUpdateVolume = useCallback((alarmVolume: number) => {
    updateSettings({ alarmVolume });
  }, [updateSettings]);

  const handleUpdateDefaultTemplate = useCallback((defaultTemplateId: string) => {
    updateSettings({ defaultTemplateId });
  }, [updateSettings]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Application Preferences</span>
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Settings & Configuration
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Customize your timer presets, alarms, theme, and desktop notifications.
        </p>
      </div>

      {/* THEME & APPEARANCE */}
      <AppearanceSettings 
        theme={settings.theme} 
        onUpdateTheme={handleUpdateTheme} 
      />

      {/* ALARM & NOTIFICATIONS */}
      <NotificationSettings
        alarmSound={settings.alarmSound}
        alarmVolume={settings.alarmVolume}
        notificationStatus={notificationStatus}
        onUpdateSound={handleUpdateSound}
        onUpdateVolume={handleUpdateVolume}
        onTestSound={handleTestSound}
        onRequestNotification={handleRequestNotification}
      />

      {/* CUSTOM TIMER PRESETS */}
      <TimerSettings
        presets={settings.presets}
        activePresetId={settings.activePresetId}
        onUpdatePreset={handleUpdatePreset}
      />

      {/* DEFAULT TEMPLATE & PWA METRICS */}
      <TemplateSettings
        templates={templates}
        defaultTemplateId={settings.defaultTemplateId}
        onUpdateDefaultTemplate={handleUpdateDefaultTemplate}
      />

      {/* LOCAL BACKUP & RESTORE */}
      <BackupSettings />
    </div>
  );
};
