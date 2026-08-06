import React, { useState, useEffect } from 'react';
import { usePomodoroStore, ActiveTab } from '../store/usePomodoroStore';
import { 
  Search, 
  Timer, 
  CheckSquare, 
  BarChart3, 
  Layers, 
  History, 
  Settings, 
  Play, 
  Pause, 
  Moon, 
  Sun,
  Sparkles,
  X
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen,
    setActiveTab,
    tasks,
    setActiveTaskId,
    timer,
    startTimer,
    pauseTimer,
    settings,
    updateSettings,
    templates,
    applyTemplateToToday
  } = usePomodoroStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  interface CommandItem {
    id: string;
    title: string;
    category: string;
    icon: React.ReactNode;
    action: () => void;
  }

  const navCommands: CommandItem[] = [
    { id: 'nav-dashboard', title: 'Go to Timer View', category: 'Navigation', icon: <Timer className="w-4 h-4 text-rose-500" />, action: () => setActiveTab('dashboard') },
    { id: 'nav-tasks', title: 'Go to Tasks Workspace', category: 'Navigation', icon: <CheckSquare className="w-4 h-4 text-emerald-500" />, action: () => setActiveTab('tasks') },
    { id: 'nav-reports', title: 'Go to Analytics & Reports', category: 'Navigation', icon: <BarChart3 className="w-4 h-4 text-sky-500" />, action: () => setActiveTab('reports') },
    { id: 'nav-templates', title: 'Go to Templates', category: 'Navigation', icon: <Layers className="w-4 h-4 text-amber-500" />, action: () => setActiveTab('templates') },
    { id: 'nav-history', title: 'Go to Session Logs / History', category: 'Navigation', icon: <History className="w-4 h-4 text-purple-500" />, action: () => setActiveTab('history') },
    { id: 'nav-settings', title: 'Go to Settings', category: 'Navigation', icon: <Settings className="w-4 h-4 text-zinc-400" />, action: () => setActiveTab('settings') },
  ];

  const timerCommands: CommandItem[] = [
    !timer.isRunning ? {
      id: 'timer-start',
      title: 'Start Focus Timer',
      category: 'Timer Control',
      icon: <Play className="w-4 h-4 text-rose-500" />,
      action: () => startTimer()
    } : {
      id: 'timer-pause',
      title: 'Pause Focus Timer',
      category: 'Timer Control',
      icon: <Pause className="w-4 h-4 text-amber-500" />,
      action: () => pauseTimer()
    },
    {
      id: 'theme-toggle',
      title: `Switch Theme (${settings.theme === 'dark' ? 'Light' : 'Dark'})`,
      category: 'Preferences',
      icon: settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
    }
  ];

  const taskCommands: CommandItem[] = tasks.map(task => ({
    id: `task-${task.id}`,
    title: `Set active task: ${task.name}`,
    category: 'Select Task',
    icon: <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.color }} />,
    action: () => {
      setActiveTaskId(task.id);
      setActiveTab('dashboard');
    }
  }));

  const templateCommands: CommandItem[] = templates.map(temp => ({
    id: `template-${temp.id}`,
    title: `Import "${temp.name}" template into today's tasks`,
    category: 'Templates',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    action: () => {
      applyTemplateToToday(temp.id);
      setActiveTab('tasks');
    }
  }));

  const allCommands = [...navCommands, ...timerCommands, ...taskCommands, ...templateCommands];

  const filtered = allCommands.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command, search tasks, or jump to view..."
            className="w-full bg-transparent text-sm font-semibold focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            autoFocus
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cmd.icon}
                    <span>{cmd.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>Navigation: <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↑</kbd> <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↓</kbd></span>
          <span>Select: <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↵ Enter</kbd></span>
          <span>Dismiss: <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
