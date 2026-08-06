import React, { useState } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { Template, TemplateTask } from '../../types';
import { 
  Layers, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  Edit3, 
  Star 
} from 'lucide-react';

export const TemplateManager: React.FC = () => {
  const { 
    templates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate, 
    setDefaultTemplate,
    applyTemplateToToday,
    setActiveTab
  } = usePomodoroStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTempName, setNewTempName] = useState('');
  const [newTempDesc, setNewTempDesc] = useState('');
  const [newTempTasks, setNewTempTasks] = useState<TemplateTask[]>([
    { name: '', color: '#f43f5e', estimatedPomodoros: 2, notes: '' }
  ]);

  const handleAddTaskRow = () => {
    setNewTempTasks([
      ...newTempTasks,
      { name: '', color: '#3b82f6', estimatedPomodoros: 2, notes: '' }
    ]);
  };

  const handleRemoveTaskRow = (idx: number) => {
    setNewTempTasks(newTempTasks.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTempName.trim()) return;
    const validTasks = newTempTasks.filter(t => t.name.trim().length > 0);
    if (validTasks.length === 0) return;

    createTemplate({
      name: newTempName.trim(),
      description: newTempDesc.trim(),
      tasks: validTasks
    });

    setNewTempName('');
    setNewTempDesc('');
    setNewTempTasks([{ name: '', color: '#f43f5e', estimatedPomodoros: 2, notes: '' }]);
    setShowCreateModal(false);
  };

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Task Templates</span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Reusable Workspaces
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Instantly seed your daily workspace with pre-configured routines.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`flex flex-col justify-between p-5 rounded-3xl border transition-all ${
              template.isDefault
                ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 dark:border-rose-500/30 shadow-xs'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {template.name}
                    {template.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        DEFAULT
                      </span>
                    )}
                  </h3>
                  {template.description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{template.description}</p>
                  )}
                </div>

                <button
                  onClick={() => deleteTemplate(template.id)}
                  title="Delete template"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks preview in template */}
              <div className="mt-4 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                {template.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">{task.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                      {task.estimatedPomodoros} pom
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Card Action Footer */}
            <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              {!template.isDefault ? (
                <button
                  onClick={() => setDefaultTemplate(template.id)}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-xs font-semibold text-rose-500">Default Template</span>
              )}

              <button
                onClick={() => {
                  applyTemplateToToday(template.id);
                  setActiveTab('tasks');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Use Today</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <form 
            onSubmit={handleCreateSubmit} 
            className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
              Create Reusable Template
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={newTempName}
                onChange={(e) => setNewTempName(e.target.value)}
                placeholder="e.g. Side Project Sprint"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={newTempDesc}
                onChange={(e) => setNewTempDesc(e.target.value)}
                placeholder="e.g. Daily routine for building features"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            {/* Tasks list inputs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Included Tasks
                </label>
                <button
                  type="button"
                  onClick={handleAddTaskRow}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {newTempTasks.map((tRow, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                  <input
                    type="text"
                    value={tRow.name}
                    onChange={(e) => {
                      const updated = [...newTempTasks];
                      updated[i].name = e.target.value;
                      setNewTempTasks(updated);
                    }}
                    placeholder="Task name"
                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tRow.estimatedPomodoros}
                    onChange={(e) => {
                      const updated = [...newTempTasks];
                      updated[i].estimatedPomodoros = parseInt(e.target.value) || 1;
                      setNewTempTasks(updated);
                    }}
                    className="w-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1 text-xs text-center font-mono focus:outline-none"
                  />
                  {newTempTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTaskRow(i)}
                      className="p-1 text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
