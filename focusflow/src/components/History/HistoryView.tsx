import React, { useState } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { exportSessionsToCSV } from '../../utils/csv';
import { 
  History, 
  Download, 
  Trash2, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Search
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const sessions = usePomodoroStore(state => state.sessions);
  const tasks = usePomodoroStore(state => state.tasks);
  const clearHistory = usePomodoroStore(state => state.clearHistory);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredSessions = sessions.filter(s => {
    if (selectedTaskFilter !== 'all' && s.taskId !== selectedTaskFilter) return false;
    if (selectedTypeFilter !== 'all' && s.sessionType !== selectedTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.taskName || '').toLowerCase().includes(q);
      const matchDate = s.date.includes(q);
      if (!matchName && !matchDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Session Logs</span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Pomodoro History
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit log of all completed and interrupted focus sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              onClick={() => exportSessionsToCSV(sessions)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {sessions.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task or date..."
            className="bg-transparent text-xs font-medium focus:outline-none w-full text-zinc-800 dark:text-zinc-200"
          />
        </div>

        {/* Task Filter */}
        <select
          value={selectedTaskFilter}
          onChange={(e) => setSelectedTaskFilter(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">All Tasks</option>
          {tasks.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
        >
          <option value="all">All Session Types</option>
          <option value="work">Focus Sessions</option>
          <option value="shortBreak">Short Breaks</option>
          <option value="longBreak">Long Breaks</option>
        </select>
      </div>

      {/* Table Log Container */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 text-xs text-zinc-400">
          No session history records matching filter.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-mono">
                      {s.date} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.taskColor || '#3b82f6' }} />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.taskName || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-zinc-500">
                      {s.sessionType === 'work' ? 'Focus' : s.sessionType === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                      {s.durationMinutes} mins
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.completed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Interrupted</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clear History */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 max-w-xs w-full text-center space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Clear All History?</h4>
            <p className="text-xs text-zinc-500">
              This will erase all past session logs. Analytics will reset. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setShowConfirmClear(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-xs"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
