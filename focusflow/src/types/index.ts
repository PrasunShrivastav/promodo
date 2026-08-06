export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface Preset {
  id: string;
  name: string;
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartWork: boolean;
  autoStartBreaks: boolean;
}

export interface Task {
  id: string;
  name: string;
  color: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  notes?: string;
  archived: boolean;
  createdAt: string; // ISO date string
  date: string; // YYYY-MM-DD
  order: number;
  lastWorkedDate?: string; // ISO date string
}

export interface TemplateTask {
  name: string;
  color: string;
  estimatedPomodoros: number;
  notes?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  tasks: TemplateTask[];
  isDefault?: boolean;
}

export interface SessionRecord {
  id: string;
  taskId: string;
  taskName: string;
  taskColor: string;
  date: string; // YYYY-MM-DD
  startTime: number; // Timestamp ms
  endTime: number; // Timestamp ms
  durationMinutes: number;
  sessionType: SessionType;
  completed: boolean;
  interrupted: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  sessionType: SessionType;
  startTime: number | null; // ms timestamp when last unpaused
  durationSeconds: number; // target total duration in seconds
  elapsedBeforePause: number; // elapsed seconds accumulated before pause
  currentCycle: number; // current work session count in loop (1 to sessionsBeforeLongBreak)
  activeTaskId: string | null;
}

export type AlarmSound = 'zen' | 'digital' | 'marimba' | 'bell';
export type AccentColor = 'rose' | 'emerald' | 'violet' | 'amber' | 'cyan' | 'indigo';

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  alarmVolume: number; // 0.0 to 1.0
  alarmSound: AlarmSound;
  notificationEnabled: boolean;
  activePresetId: string;
  presets: Preset[];
  defaultTemplateId?: string;
  longBreakFrequency: number;
}

export interface DailyStats {
  focusTimeMinutes: number;
  breakTimeMinutes: number;
  completedSessions: number;
  remainingPomodoros: number;
  activeTaskName: string | null;
}

export interface ReportSummary {
  todayFocusMinutes: number;
  todayBreakMinutes: number;
  todayCompletedCount: number;
  weeklyHours: number;
  weeklyAvgMinutesPerDay: number;
  mostWorkedTask: { name: string; color: string; hours: number } | null;
  monthlyHours: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: { date: string; hours: number } | null;
  lifetimeHours: number;
  lifetimeSessions: number;
  lifetimeAvgSessionMinutes: number;
}
