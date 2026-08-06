import React, { useState } from 'react';
import { Task } from '../../types';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ColorPicker } from '../common/ColorPicker';
import { 
  Play, 
  Check, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Archive, 
  Trash2, 
  FileText,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({ 
  task, 
  isFirst, 
  isLast, 
  onMoveUp, 
  onMoveDown 
}) => {
  const activeTaskId = usePomodoroStore(state => state.activeTaskId);
  const setActiveTaskId = usePomodoroStore(state => state.setActiveTaskId);
  const updateTask = usePomodoroStore(state => state.updateTask);
  const deleteTask = usePomodoroStore(state => state.deleteTask);
  const archiveTask = usePomodoroStore(state => state.archiveTask);
  const duplicateTask = usePomodoroStore(state => state.duplicateTask);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editEst, setEditEst] = useState(task.estimatedPomodoros);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isActive = activeTaskId === task.id;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateTask(task.id, {
      name: editName.trim(),
      estimatedPomodoros: Math.max(1, editEst),
      notes: editNotes.trim()
    });
    setIsEditing(false);
  };

  const progressPercent = Math.min(100, Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100));

  return (
    <div 
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isActive
          ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 dark:border-rose-500/30 shadow-xs'
          : task.archived
            ? 'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
            : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
      }`}
    >
      {/* Editing View */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span 
              className="w-3.5 h-3.5 rounded-full shrink-0" 
              style={{ backgroundColor: task.color }}
            />
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Task name..."
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Est. Pomodoros:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={editEst}
                onChange={(e) => setEditEst(parseInt(e.target.value) || 1)}
                className="w-16 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-center text-xs font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Color Palette Selector */}
            <ColorPicker
              label=""
              selectedColor={task.color || '#f43f5e'}
              onChange={(color) => updateTask(task.id, { color })}
            />
          </div>

          {/* Notes textarea */}
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={2}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
            placeholder="Add notes or sub-checklist (optional)..."
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Standard View */
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            
            {/* Active Task Selector Pill & Name */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() => setActiveTaskId(task.id)}
                title={isActive ? 'Currently Active Task' : 'Set as Active Task for Timer'}
                aria-label={isActive ? `Task ${task.name} is currently active` : `Set ${task.name} as active task`}
                className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'border border-zinc-300 dark:border-zinc-700 hover:border-rose-500 hover:text-rose-500 text-transparent'
                }`}
              >
                {isActive ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: task.color || '#f43f5e' }}
                  />
                  <h3 className={`text-sm font-bold tracking-tight truncate ${
                    task.archived ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                  }`}>
                    {task.name}
                  </h3>
                  {isActive && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold border border-rose-500/20">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Progress Stats */}
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 font-medium">
                  <span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{task.completedPomodoros}</strong> / {task.estimatedPomodoros} Pomodoros
                  </span>
                  <span>•</span>
                  <span>{progressPercent}% Complete</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Menu */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Move up / down buttons */}
              <div className="hidden sm:flex flex-col">
                <button
                  disabled={isFirst}
                  onClick={onMoveUp}
                  aria-label="Move task up"
                  className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={isLast}
                  onClick={onMoveDown}
                  aria-label="Move task down"
                  className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notes toggle */}
              {task.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  title="Toggle Notes"
                  aria-label="Toggle task notes"
                  className={`p-1.5 rounded-lg transition-colors ${showNotes ? 'bg-zinc-200 dark:bg-zinc-800 text-rose-500' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}

              {/* Three dots menu dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="Task options menu"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 z-20 text-xs">
                    <button
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={() => { duplicateTask(task.id); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => { archiveTask(task.id); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{task.archived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                    <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1" />
                    <button
                      onClick={() => { setShowConfirmDelete(true); setShowMenu(false); }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div 
            className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div 
              className="h-full rounded-full transition-all duration-300" 
              style={{ 
                width: `${progressPercent}%`, 
                backgroundColor: task.color || '#f43f5e' 
              }} 
            />
          </div>

          {/* Notes Preview Drawer */}
          {showNotes && task.notes && (
            <div className="mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono">
              {task.notes}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal overlay for Delete */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
        confirmText="Delete Task"
        isDanger={true}
        onConfirm={() => { deleteTask(task.id); setShowConfirmDelete(false); }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
