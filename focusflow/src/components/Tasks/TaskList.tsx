import React, { useState, useMemo } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { TaskCard } from './TaskCard';
import { ColorPicker } from '../common/ColorPicker';
import { EmptyState } from '../common/EmptyState';
import { 
  Plus, 
  Sparkles, 
  Layers,
  Calendar
} from 'lucide-react';
import { getTodayDateString } from '../../utils/analytics';

export const TaskList: React.FC = React.memo(() => {
  const tasks = usePomodoroStore(state => state.tasks);
  const createTask = usePomodoroStore(state => state.createTask);
  const reorderTasks = usePomodoroStore(state => state.reorderTasks);
  const templates = usePomodoroStore(state => state.templates);
  const applyTemplateToToday = usePomodoroStore(state => state.applyTemplateToToday);
  const settings = usePomodoroStore(state => state.settings);

  const [filter, setFilter] = useState<'active' | 'completed' | 'archived'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskEst, setNewTaskEst] = useState(2);
  const [newTaskColor, setNewTaskColor] = useState('#f43f5e');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(settings.defaultTemplateId || templates[0]?.id || '');

  const todayStr = getTodayDateString();

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    createTask(newTaskName.trim(), newTaskEst, newTaskColor, newTaskNotes.trim());
    setNewTaskName('');
    setNewTaskNotes('');
    setShowAddForm(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'archived') return t.archived;
      if (t.archived) return false;
      if (filter === 'completed') return t.completedPomodoros >= t.estimatedPomodoros;
      return t.completedPomodoros < t.estimatedPomodoros;
    }).sort((a, b) => a.order - b.order);
  }, [tasks, filter]);

  // Move items up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredTasks.length) return;
    const copy = [...filteredTasks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    reorderTasks(copy);
  };

  const activeCount = useMemo(() => tasks.filter(t => !t.archived && t.completedPomodoros < t.estimatedPomodoros).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => !t.archived && t.completedPomodoros >= t.estimatedPomodoros).length, [tasks]);
  const archivedCount = useMemo(() => tasks.filter(t => t.archived).length, [tasks]);

  const defaultTemplate = useMemo(() => templates.find(t => t.id === selectedTemplateId) || templates[0], [templates, selectedTemplateId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
      
      {/* Workspace Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Workspace • {todayStr}</span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Daily Focus Tasks
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize your target Pomodoros for maximum flow and tracking.
          </p>
        </div>

        {/* Quick Action: Create Today's Tasks from Template */}
        {templates.length > 0 && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.tasks.length} tasks)
                </option>
              ))}
            </select>
            <button
              onClick={() => applyTemplateToToday(selectedTemplateId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Import Today's Tasks</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Add Button Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800" role="tablist">
          <button
            role="tab"
            aria-selected={filter === 'active'}
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              filter === 'active'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            role="tab"
            aria-selected={filter === 'completed'}
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              filter === 'completed'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            role="tab"
            aria-selected={filter === 'archived'}
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              filter === 'archived'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Add Task Form Collapsible */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateTask} 
          className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4 animate-in slide-in-from-top-3 duration-200"
        >
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Create New Task</h3>

          <div className="space-y-3">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="What are you working on? (e.g. Implement Auth Endpoint)"
              className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              autoFocus
              required
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">Estimated Pomodoros:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newTaskEst}
                  onChange={(e) => setNewTaskEst(parseInt(e.target.value) || 1)}
                  className="w-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Color Picker Component */}
              <ColorPicker
                label=""
                selectedColor={newTaskColor}
                onChange={setNewTaskColor}
              />
            </div>

            <textarea
              value={newTaskNotes}
              onChange={(e) => setNewTaskNotes(e.target.value)}
              rows={2}
              placeholder="Notes, links, or acceptance criteria (optional)..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List Cards Container */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-10 h-10" />}
          title={`No ${filter} tasks found`}
          description={filter === 'active' 
            ? "Your workspace is clear! Add a task or import one from your templates to start focusing."
            : `No tasks currently in ${filter}.`}
          actionLabel={filter === 'active' && defaultTemplate ? `Import "${defaultTemplate.name}" Template` : undefined}
          onAction={filter === 'active' && defaultTemplate ? () => applyTemplateToToday(defaultTemplate.id) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              isFirst={index === 0}
              isLast={index === filteredTasks.length - 1}
              onMoveUp={() => handleMove(index, 'up')}
              onMoveDown={() => handleMove(index, 'down')}
            />
          ))}
        </div>
      )}
    </div>
  );
});

TaskList.displayName = 'TaskList';
