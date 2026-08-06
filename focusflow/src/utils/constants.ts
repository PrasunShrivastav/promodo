import { Preset, Template, UserSettings } from '../types';

export const TASK_COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'preset-standard',
    name: '25 / 5 Standard',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartWork: false,
    autoStartBreaks: true
  },
  {
    id: 'preset-deepwork',
    name: '50 / 10 Deep Work',
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 25,
    sessionsBeforeLongBreak: 3,
    autoStartWork: false,
    autoStartBreaks: true
  },
  {
    id: 'preset-ultradian',
    name: '90 / 20 Ultradian',
    workDuration: 90,
    shortBreakDuration: 20,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 2,
    autoStartWork: false,
    autoStartBreaks: false
  }
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'template-interview-prep',
    name: 'Interview Prep',
    description: 'Structured routine for software engineering interviews',
    isDefault: true,
    tasks: [
      { name: 'DSA & LeetCode', color: '#f43f5e', estimatedPomodoros: 4, notes: 'Solve 2 medium/hard problem patterns' },
      { name: 'Backend Engineering', color: '#3b82f6', estimatedPomodoros: 3, notes: 'API endpoints, indexing & DB optimization' },
      { name: 'System Design', color: '#8b5cf6', estimatedPomodoros: 2, notes: 'Load balancing, caching & rate limiters' },
      { name: 'Resume & Behavioral', color: '#10b981', estimatedPomodoros: 1, notes: 'Refine STAR stories & impact metrics' }
    ]
  },
  {
    id: 'template-college',
    name: 'College Study',
    description: 'Academic coursework, labs, and exam revision',
    tasks: [
      { name: 'Assignment & Papers', color: '#f59e0b', estimatedPomodoros: 3, notes: 'Draft submission sections' },
      { name: 'Lab Practical', color: '#06b6d4', estimatedPomodoros: 2, notes: 'Complete lab scripts & verification' },
      { name: 'Revision & Flashcards', color: '#ec4899', estimatedPomodoros: 2, notes: 'Review lecture slides & key theorems' }
    ]
  },
  {
    id: 'template-open-source',
    name: 'Open Source',
    description: 'Contributing to repositories, docs, and pull requests',
    tasks: [
      { name: 'Feature Implementation', color: '#10b981', estimatedPomodoros: 4, notes: 'Write code & tests for open issue' },
      { name: 'Documentation', color: '#6366f1', estimatedPomodoros: 1, notes: 'Improve API docs & code examples' },
      { name: 'PR Review & Triage', color: '#f43f5e', estimatedPomodoros: 1, notes: 'Review community PRs & issue queue' }
    ]
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  accentColor: 'rose',
  alarmVolume: 0.8,
  alarmSound: 'zen',
  notificationEnabled: true,
  activePresetId: 'preset-standard',
  presets: DEFAULT_PRESETS,
  defaultTemplateId: 'template-interview-prep',
  longBreakFrequency: 4
};
