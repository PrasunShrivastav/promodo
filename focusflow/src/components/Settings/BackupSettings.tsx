import React, { useState, useRef } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { saveStoredTasks, saveStoredTemplates, saveStoredSessions, saveStoredSettings } from '../../utils/idbStorage';
import { Download, Upload, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export const BackupSettings: React.FC = React.memo(() => {
  const tasks = usePomodoroStore(state => state.tasks);
  const templates = usePomodoroStore(state => state.templates);
  const sessions = usePomodoroStore(state => state.sessions);
  const settings = usePomodoroStore(state => state.settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'ChronoFocus',
        version: '1.0',
        exportDate: new Date().toISOString(),
        tasks,
        templates,
        sessions,
        settings
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      const todayStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `chronofocus-backup-${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatus({ type: 'success', message: 'Backup file chronofocus-backup.json created successfully!' });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error('Export failed:', err);
      setStatus({ type: 'error', message: 'Failed to generate backup JSON file.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation pass
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('File does not contain valid JSON object.');
        }

        if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.templates) || !Array.isArray(parsed.sessions)) {
          throw new Error('Invalid backup structure. Missing tasks, templates, or sessions arrays.');
        }

        if (!parsed.settings || typeof parsed.settings !== 'object' || !parsed.settings.presets) {
          throw new Error('Invalid backup structure. Settings data missing or corrupt.');
        }

        // Apply backup to IndexedDB
        await saveStoredTasks(parsed.tasks);
        await saveStoredTemplates(parsed.templates);
        await saveStoredSessions(parsed.sessions);
        await saveStoredSettings(parsed.settings);

        // Update store in-memory
        usePomodoroStore.setState({
          tasks: parsed.tasks,
          templates: parsed.templates,
          sessions: parsed.sessions,
          settings: parsed.settings,
          activeTaskId: parsed.tasks.find((t: any) => !t.archived)?.id || null
        });

        setStatus({ type: 'success', message: 'Backup restored successfully! All data, templates, and history updated.' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        console.error('Restore error:', err);
        setStatus({ type: 'error', message: err.message || 'Failed to restore backup file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-500" />
          <span>Local Backup & Restore</span>
        </h3>
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
          JSON Storage Engine
        </span>
      </div>

      <p className="text-xs text-zinc-500">
        Export your complete workspace (tasks, custom templates, session log history, and settings) to a JSON file or restore from a previous backup.
      </p>

      {status && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Backup JSON</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Backup JSON</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
});

BackupSettings.displayName = 'BackupSettings';
