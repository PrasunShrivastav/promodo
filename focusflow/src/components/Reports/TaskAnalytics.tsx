import React from 'react';
import { Task, SessionRecord } from '../../types';
import { Target } from 'lucide-react';

interface TaskAnalyticsProps {
  tasks: Task[];
  sessions: SessionRecord[];
}

export const TaskAnalytics: React.FC<TaskAnalyticsProps> = React.memo(({ tasks, sessions }) => {
  return (
    <section aria-labelledby="task-analytics-heading">
      <h3 id="task-analytics-heading" className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Target className="w-4 h-4 text-sky-500" />
        <span>Task Velocity & Completion Breakdown</span>
      </h3>

      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400">No tasks registered yet</div>
        ) : (
          tasks.map(task => {
            const pct = Math.min(100, Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100));
            const taskSessions = sessions.filter(s => s.taskId === task.id && s.completed && s.sessionType === 'work');
            const totalMins = taskSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
            const avgLen = taskSessions.length > 0 ? Math.round(totalMins / taskSessions.length) : 0;

            return (
              <div key={task.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.color || '#f43f5e' }} />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{task.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {task.completedPomodoros} / {task.estimatedPomodoros} ({pct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div 
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: task.color || '#f43f5e' }} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                  <span>Total Focus: {Math.floor(totalMins / 60)}h {totalMins % 60}m</span>
                  <span>Avg Session: {avgLen}m</span>
                  <span>Last Worked: {task.lastWorkedDate ? task.lastWorkedDate.slice(0, 10) : 'Never'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
});

TaskAnalytics.displayName = 'TaskAnalytics';
