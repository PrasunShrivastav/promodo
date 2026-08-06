import { SessionRecord, Task, ReportSummary } from '../types';

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current and longest streaks of consecutive days with at least 1 completed session
 */
export function calculateStreaks(sessions: SessionRecord[]): { currentStreak: number; longestStreak: number } {
  const completedWorkSessions = sessions.filter(s => s.completed && s.sessionType === 'work');
  if (completedWorkSessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique sorted dates (YYYY-MM-DD)
  const dateSet = new Set(completedWorkSessions.map(s => s.date));
  const sortedDates = Array.from(dateSet).sort();

  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      currentRun += 1;
      if (currentRun > maxStreak) maxStreak = currentRun;
    } else {
      currentRun = 1;
    }
  }

  // Calculate current streak relative to Today / Yesterday
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getTodayDateString(yesterdayDate);

  let activeStreak = 0;
  let checkDate = new Date();

  // If today has session, start checking backwards from today; if not, check from yesterday
  if (dateSet.has(today)) {
    checkDate = new Date();
  } else if (dateSet.has(yesterday)) {
    checkDate = yesterdayDate;
  } else {
    return { currentStreak: 0, longestStreak: maxStreak };
  }

  while (dateSet.has(getTodayDateString(checkDate))) {
    activeStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    currentStreak: activeStreak,
    longestStreak: Math.max(activeStreak, maxStreak)
  };
}

export function generateReportSummary(sessions: SessionRecord[], tasks: Task[]): ReportSummary {
  const todayStr = getTodayDateString();

  // Today sessions
  const todaySessions = sessions.filter(s => s.date === todayStr && s.completed);
  const todayFocusMinutes = todaySessions
    .filter(s => s.sessionType === 'work')
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayBreakMinutes = todaySessions
    .filter(s => s.sessionType !== 'work')
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayCompletedCount = todaySessions.filter(s => s.sessionType === 'work').length;

  // Past 7 days
  const now = new Date();
  const past7DaysMs = 7 * 24 * 60 * 60 * 1000;
  const weeklySessions = sessions.filter(s => s.completed && s.sessionType === 'work' && (now.getTime() - new Date(s.date).getTime()) <= past7DaysMs);
  const weeklyTotalMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const weeklyHours = Number((weeklyTotalMinutes / 60).toFixed(1));
  const weeklyAvgMinutesPerDay = Math.round(weeklyTotalMinutes / 7);

  // Most Worked Task
  const taskMap: Record<string, { name: string; color: string; minutes: number }> = {};
  sessions.filter(s => s.completed && s.sessionType === 'work').forEach(s => {
    if (!taskMap[s.taskId]) {
      taskMap[s.taskId] = { name: s.taskName || 'General', color: s.taskColor || '#3b82f6', minutes: 0 };
    }
    taskMap[s.taskId].minutes += s.durationMinutes;
  });

  let mostWorked: { name: string; color: string; hours: number } | null = null;
  let maxMin = 0;
  Object.values(taskMap).forEach(t => {
    if (t.minutes > maxMin) {
      maxMin = t.minutes;
      mostWorked = { name: t.name, color: t.color, hours: Number((t.minutes / 60).toFixed(1)) };
    }
  });

  // Past 30 days (Monthly)
  const past30DaysMs = 30 * 24 * 60 * 60 * 1000;
  const monthlySessions = sessions.filter(s => s.completed && s.sessionType === 'work' && (now.getTime() - new Date(s.date).getTime()) <= past30DaysMs);
  const monthlyTotalMinutes = monthlySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const monthlyHours = Number((monthlyTotalMinutes / 60).toFixed(1));

  // Best Day
  const dayMinutesMap: Record<string, number> = {};
  sessions.filter(s => s.completed && s.sessionType === 'work').forEach(s => {
    dayMinutesMap[s.date] = (dayMinutesMap[s.date] || 0) + s.durationMinutes;
  });

  let bestDay: { date: string; hours: number } | null = null;
  let maxDayMin = 0;
  Object.entries(dayMinutesMap).forEach(([date, mins]) => {
    if (mins > maxDayMin) {
      maxDayMin = mins;
      bestDay = { date, hours: Number((mins / 60).toFixed(1)) };
    }
  });

  // Lifetime
  const allWorkSessions = sessions.filter(s => s.completed && s.sessionType === 'work');
  const lifetimeTotalMinutes = allWorkSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const lifetimeHours = Number((lifetimeTotalMinutes / 60).toFixed(1));
  const lifetimeSessions = allWorkSessions.length;
  const lifetimeAvgSessionMinutes = lifetimeSessions > 0 ? Math.round(lifetimeTotalMinutes / lifetimeSessions) : 0;

  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  return {
    todayFocusMinutes,
    todayBreakMinutes,
    todayCompletedCount,
    weeklyHours,
    weeklyAvgMinutesPerDay,
    mostWorkedTask: mostWorked,
    monthlyHours,
    currentStreak,
    longestStreak,
    bestDay,
    lifetimeHours,
    lifetimeSessions,
    lifetimeAvgSessionMinutes
  };
}

export function getWeeklyChartData(sessions: SessionRecord[]) {
  const result = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayName = days[d.getDay()];

    const daySessions = sessions.filter(s => s.date === dateStr && s.completed && s.sessionType === 'work');
    const mins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const hours = Number((mins / 60).toFixed(1));

    result.push({
      date: dateStr,
      day: dayName,
      hours,
      minutes: mins
    });
  }
  return result;
}

export function getMonthlyTrendData(sessions: SessionRecord[]) {
  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);

    const daySessions = sessions.filter(s => s.date === dateStr && s.completed && s.sessionType === 'work');
    const mins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const hours = Number((mins / 60).toFixed(1));

    result.push({
      date: dateStr.slice(5), // MM-DD
      hours
    });
  }
  return result;
}
