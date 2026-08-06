import React from 'react';
import { Template } from '../../types';
import { Layers, Smartphone } from 'lucide-react';

interface TemplateSettingsProps {
  templates: Template[];
  defaultTemplateId?: string;
  onUpdateDefaultTemplate: (templateId: string) => void;
}

export const TemplateSettings: React.FC<TemplateSettingsProps> = React.memo(({
  templates,
  defaultTemplateId,
  onUpdateDefaultTemplate
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Default Template */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-500" />
          <span>Default Task Template</span>
        </h3>
        <p className="text-xs text-zinc-500">
          Select the default template used when seeding new workspaces.
        </p>
        <select
          value={defaultTemplateId || ''}
          onChange={(e) => onUpdateDefaultTemplate(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* PWA App Information */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-500" />
          <span>Progressive Web App</span>
        </h3>
        <p className="text-xs text-zinc-500">
          ChronoFocus runs offline with IndexedDB local caching and instant desktop experience.
        </p>
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-1">
          <span>Storage Engine: IndexedDB</span>
          <span className="text-emerald-500 font-bold">✔ Active</span>
        </div>
      </div>
    </div>
  );
});

TemplateSettings.displayName = 'TemplateSettings';
