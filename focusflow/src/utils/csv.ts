import { SessionRecord } from '../types';

export function exportSessionsToCSV(sessions: SessionRecord[]) {
  if (sessions.length === 0) return;

  const headers = ['ID', 'Task Name', 'Date', 'Start Time', 'End Time', 'Duration (Min)', 'Session Type', 'Completed', 'Interrupted'];
  const rows = sessions.map(s => [
    s.id,
    `"${(s.taskName || 'General').replace(/"/g, '""')}"`,
    s.date,
    new Date(s.startTime).toLocaleTimeString(),
    new Date(s.endTime).toLocaleTimeString(),
    s.durationMinutes,
    s.sessionType,
    s.completed ? 'Yes' : 'No',
    s.interrupted ? 'Yes' : 'No'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `chronofocus_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
