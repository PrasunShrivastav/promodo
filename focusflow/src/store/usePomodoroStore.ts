import { create } from 'zustand';
import { 
  Task, 
  Template, 
  SessionRecord, 
  TimerState, 
  UserSettings, 
  SessionType, 
  Preset 
} from '../types';
import { DEFAULT_PRESETS, DEFAULT_SETTINGS, DEFAULT_TEMPLATES } from '../utils/constants';
import { getTodayDateString } from '../utils/analytics';
import { startAlarmLoop, stopAlarmLoop } from '../utils/audio';
import { sendDesktopNotification, startTabTitleFlash, stopTabTitleFlash } from '../utils/notifications';
import { 
  migrateLocalStorageToIDB, 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredTasks, 
  saveStoredTasks, 
  getStoredTemplates, 
  saveStoredTemplates, 
  getStoredSessions, 
  addStoredSession, 
  clearStoredSessions, 
  getStoredTimerState, 
  saveStoredTimerState,
  getLastRolloverDate,
  setLastRolloverDate
} from '../utils/idbStorage';
import confetti from 'canvas-confetti';

export type ActiveTab = 'dashboard' | 'tasks' | 'reports' | 'templates' | 'history' | 'settings';

interface PomodoroStore {
  // Initialization Status
  isInitialized: boolean;
  initializeStore: () => Promise<void>;

  // Navigation & UI
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isShortcutModalOpen: boolean;
  setShortcutModalOpen: (open: boolean) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  setActivePreset: (presetId: string) => void;

  // Tasks
  tasks: Task[];
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  createTask: (name: string, estimatedPomodoros?: number, color?: string, notes?: string) => void;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  reorderTasks: (reordered: Task[]) => void;
  applyTemplateToToday: (templateId: string) => void;

  // Templates
  templates: Template[];
  createTemplate: (template: Omit<Template, 'id'>) => void;
  updateTemplate: (id: string, partial: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;

  // Sessions
  sessions: SessionRecord[];
  addSession: (session: Omit<SessionRecord, 'id'>) => void;
  clearHistory: () => void;

  // Timer Engine
  timer: TimerState;
  isAlarmRinging: boolean;
  alarmSessionType: SessionType | null;

  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipPhase: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  selectPresetAndReset: (preset: Preset) => void;
  tickTimer: () => void;
  dismissAlarm: () => void;
  snoozeAlarm: () => void;

  // Daily Rollover
  checkAndPerformRollover: () => Promise<void>;
  pendingRollover: boolean;
}

const defaultTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  sessionType: 'work',
  startTime: null,
  durationSeconds: DEFAULT_PRESETS[0].workDuration * 60,
  elapsedBeforePause: 0,
  currentCycle: 1,
  activeTaskId: null
};

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  isInitialized: false,

  initializeStore: async () => {
    if (get().isInitialized) return;

    try {
      // 1. Run localStorage -> IDB migration
      await migrateLocalStorageToIDB();

      // 2. Load stored state from IndexedDB
      const [settings, tasks, templates, sessions, timerState, lastRollover] = await Promise.all([
        getStoredSettings(),
        getStoredTasks(),
        getStoredTemplates(),
        getStoredSessions(),
        getStoredTimerState(),
        getLastRolloverDate()
      ]);

      const todayStr = getTodayDateString();
      let currentTasks = tasks;
      let activePreset = settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];

      // 3. Perform Rollover if date changed & timer is not running
      const isTimerRunning = timerState?.isRunning ?? false;
      let needsRollover = lastRollover !== todayStr;
      let isPending = false;

      if (needsRollover) {
        if (isTimerRunning) {
          isPending = true;
        } else {
          // Perform Rollover
          currentTasks = currentTasks.map(t => {
            if (t.date !== todayStr && !t.archived) {
              return { ...t, archived: true };
            }
            return t;
          });

          // Seed default template if today has no tasks
          const todayTasks = currentTasks.filter(t => t.date === todayStr);
          if (todayTasks.length === 0 && settings.defaultTemplateId) {
            const defTemp = templates.find(t => t.id === settings.defaultTemplateId);
            if (defTemp) {
              const newTasks: Task[] = defTemp.tasks.map((t, idx) => ({
                id: `task-auto-${Date.now()}-${idx}`,
                name: t.name,
                color: t.color,
                estimatedPomodoros: t.estimatedPomodoros,
                completedPomodoros: 0,
                notes: t.notes || '',
                archived: false,
                createdAt: new Date().toISOString(),
                date: todayStr,
                order: idx
              }));
              currentTasks = [...currentTasks, ...newTasks];
            }
          }

          await saveStoredTasks(currentTasks);
          await setLastRolloverDate(todayStr);
        }
      }

      // Determine initial active task
      const activeTask = currentTasks.find(t => !t.archived) || null;

      // Restored Timer
      const restoredTimer: TimerState = timerState ? {
        ...timerState,
        activeTaskId: currentTasks.some(t => t.id === timerState.activeTaskId) 
          ? timerState.activeTaskId 
          : (activeTask?.id || null)
      } : {
        ...defaultTimerState,
        durationSeconds: activePreset.workDuration * 60,
        activeTaskId: activeTask?.id || null
      };

      // Set HTML theme
      if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      set({
        settings,
        tasks: currentTasks,
        templates,
        sessions,
        timer: restoredTimer,
        activeTaskId: restoredTimer.activeTaskId,
        pendingRollover: isPending,
        isInitialized: true
      });
    } catch (err) {
      console.error('Failed to initialize store from IndexedDB:', err);
      set({ isInitialized: true });
    }
  },

  // Navigation & UI
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  isShortcutModalOpen: false,
  setShortcutModalOpen: (open) => set({ isShortcutModalOpen: open }),

  // Settings
  settings: DEFAULT_SETTINGS,
  updateSettings: (partial) => {
    set((state) => {
      const updated = { ...state.settings, ...partial };
      saveStoredSettings(updated);

      if (updated.theme === 'dark' || (updated.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return { settings: updated };
    });
  },

  setActivePreset: (presetId) => {
    const { settings, selectPresetAndReset } = get();
    const preset = settings.presets.find(p => p.id === presetId);
    if (preset) {
      set((state) => {
        const updated = { ...state.settings, activePresetId: presetId };
        saveStoredSettings(updated);
        return { settings: updated };
      });
      selectPresetAndReset(preset);
    }
  },

  // Tasks
  tasks: [],
  activeTaskId: null,
  setActiveTaskId: (id) => {
    set((state) => {
      const updatedTimer = { ...state.timer, activeTaskId: id };
      saveStoredTimerState(updatedTimer);
      return { activeTaskId: id, timer: updatedTimer };
    });
  },

  createTask: (name, estimatedPomodoros = 1, color = '#f43f5e', notes = '') => {
    const today = getTodayDateString();
    set((state) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        color,
        estimatedPomodoros: Math.max(1, estimatedPomodoros),
        completedPomodoros: 0,
        notes,
        archived: false,
        createdAt: new Date().toISOString(),
        date: today,
        order: state.tasks.length
      };
      const updatedTasks = [...state.tasks, newTask];
      saveStoredTasks(updatedTasks);

      const activeId = state.activeTaskId || newTask.id;
      const updatedTimer = { ...state.timer, activeTaskId: activeId };
      saveStoredTimerState(updatedTimer);

      return { 
        tasks: updatedTasks, 
        activeTaskId: activeId,
        timer: updatedTimer
      };
    });
  },

  updateTask: (id, partial) => {
    set((state) => {
      const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, ...partial } : t);
      saveStoredTasks(updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter(t => t.id !== id);
      saveStoredTasks(updatedTasks);
      const newActiveId = state.activeTaskId === id ? (updatedTasks[0]?.id || null) : state.activeTaskId;
      const updatedTimer = { ...state.timer, activeTaskId: newActiveId };
      saveStoredTimerState(updatedTimer);

      return { 
        tasks: updatedTasks, 
        activeTaskId: newActiveId,
        timer: updatedTimer
      };
    });
  },

  archiveTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.map(t => t.id === id ? { ...t, archived: !t.archived } : t);
      saveStoredTasks(updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  duplicateTask: (id) => {
    const { tasks } = get();
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    set((state) => {
      const dup: Task = {
        ...target,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${target.name} (Copy)`,
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
        order: state.tasks.length
      };
      const updated = [...state.tasks, dup];
      saveStoredTasks(updated);
      return { tasks: updated };
    });
  },

  reorderTasks: (reordered) => {
    set(() => {
      const updated = reordered.map((t, idx) => ({ ...t, order: idx }));
      saveStoredTasks(updated);
      return { tasks: updated };
    });
  },

  applyTemplateToToday: (templateId) => {
    const { templates, tasks } = get();
    const targetTemp = templates.find(t => t.id === templateId);
    if (!targetTemp) return;

    const today = getTodayDateString();
    const newTasks: Task[] = targetTemp.tasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      name: t.name,
      color: t.color,
      estimatedPomodoros: t.estimatedPomodoros,
      completedPomodoros: 0,
      notes: t.notes || '',
      archived: false,
      createdAt: new Date().toISOString(),
      date: today,
      order: tasks.length + idx
    }));

    set((state) => {
      const updated = [...state.tasks, ...newTasks];
      saveStoredTasks(updated);
      const activeId = state.activeTaskId || newTasks[0]?.id || null;
      return { tasks: updated, activeTaskId: activeId };
    });
  },

  // Templates
  templates: DEFAULT_TEMPLATES,
  createTemplate: (templateData) => {
    set((state) => {
      const newTemplate: Template = {
        ...templateData,
        id: `template-${Date.now()}`
      };
      const updated = [...state.templates, newTemplate];
      saveStoredTemplates(updated);
      return { templates: updated };
    });
  },

  updateTemplate: (id, partial) => {
    set((state) => {
      const updated = state.templates.map(t => t.id === id ? { ...t, ...partial } : t);
      saveStoredTemplates(updated);
      return { templates: updated };
    });
  },

  deleteTemplate: (id) => {
    set((state) => {
      const updated = state.templates.filter(t => t.id !== id);
      saveStoredTemplates(updated);
      return { templates: updated };
    });
  },

  setDefaultTemplate: (id) => {
    set((state) => {
      const updated = state.templates.map(t => ({ ...t, isDefault: t.id === id }));
      saveStoredTemplates(updated);
      return { templates: updated };
    });
  },

  // Sessions
  sessions: [],
  addSession: (sessionData) => {
    const newSession: SessionRecord = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    addStoredSession(newSession);
    set((state) => ({ sessions: [newSession, ...state.sessions] }));
  },

  clearHistory: () => {
    clearStoredSessions();
    set({ sessions: [] });
  },

  // Timer Engine
  timer: defaultTimerState,
  isAlarmRinging: false,
  alarmSessionType: null,
  pendingRollover: false,

  selectPresetAndReset: (preset) => {
    set((state) => {
      const newTimer: TimerState = {
        isRunning: false,
        isPaused: false,
        sessionType: 'work',
        startTime: null,
        durationSeconds: preset.workDuration * 60,
        elapsedBeforePause: 0,
        currentCycle: 1,
        activeTaskId: state.activeTaskId
      };
      saveStoredTimerState(newTimer);
      return { timer: newTimer };
    });
  },

  startTimer: () => {
    set((state) => {
      const updatedTimer: TimerState = {
        ...state.timer,
        isRunning: true,
        isPaused: false,
        startTime: Date.now()
      };
      saveStoredTimerState(updatedTimer);
      return { timer: updatedTimer };
    });
  },

  pauseTimer: () => {
    set((state) => {
      if (!state.timer.isRunning || !state.timer.startTime) return state;
      const elapsedNow = Math.floor((Date.now() - state.timer.startTime) / 1000);
      const updatedTimer: TimerState = {
        ...state.timer,
        isRunning: false,
        isPaused: true,
        startTime: null,
        elapsedBeforePause: state.timer.elapsedBeforePause + elapsedNow
      };
      saveStoredTimerState(updatedTimer);
      return { timer: updatedTimer };
    });
  },

  resumeTimer: () => {
    set((state) => {
      if (!state.timer.isPaused) return state;
      const updatedTimer: TimerState = {
        ...state.timer,
        isRunning: true,
        isPaused: false,
        startTime: Date.now()
      };
      saveStoredTimerState(updatedTimer);
      return { timer: updatedTimer };
    });
  },

  skipPhase: () => {
    const { timer, settings, tasks, addSession, checkAndPerformRollover } = get();
    
    // Record interrupted session if timer was active
    if (timer.elapsedBeforePause > 10 || timer.startTime) {
      const activeTask = tasks.find(t => t.id === timer.activeTaskId);
      const elapsedMins = Math.max(1, Math.round((timer.elapsedBeforePause + (timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0)) / 60));
      addSession({
        taskId: activeTask?.id || 'none',
        taskName: activeTask?.name || 'General Task',
        taskColor: activeTask?.color || '#3b82f6',
        date: getTodayDateString(),
        startTime: timer.startTime || Date.now() - elapsedMins * 60000,
        endTime: Date.now(),
        durationMinutes: elapsedMins,
        sessionType: timer.sessionType,
        completed: false,
        interrupted: true
      });
    }

    const currentPreset = settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];
    let nextType: SessionType = 'work';
    let nextCycle = timer.currentCycle;

    if (timer.sessionType === 'work') {
      if (timer.currentCycle >= currentPreset.sessionsBeforeLongBreak) {
        nextType = 'longBreak';
        nextCycle = 1;
      } else {
        nextType = 'shortBreak';
      }
    } else {
      nextType = 'work';
      if (timer.sessionType === 'shortBreak') {
        nextCycle = timer.currentCycle + 1;
      }
    }

    const durationMins = nextType === 'work' 
      ? currentPreset.workDuration 
      : nextType === 'shortBreak' 
        ? currentPreset.shortBreakDuration 
        : currentPreset.longBreakDuration;

    set((state) => {
      const updatedTimer: TimerState = {
        isRunning: false,
        isPaused: false,
        sessionType: nextType,
        startTime: null,
        durationSeconds: durationMins * 60,
        elapsedBeforePause: 0,
        currentCycle: nextCycle,
        activeTaskId: state.activeTaskId
      };
      saveStoredTimerState(updatedTimer);
      return { timer: updatedTimer };
    });

    // Check rollover when session ends
    checkAndPerformRollover();
  },

  stopTimer: () => {
    const { timer, settings, checkAndPerformRollover } = get();
    const currentPreset = settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];
    const durationMins = timer.sessionType === 'work' 
      ? currentPreset.workDuration 
      : timer.sessionType === 'shortBreak' 
        ? currentPreset.shortBreakDuration 
        : currentPreset.longBreakDuration;

    set((state) => {
      const updatedTimer: TimerState = {
        ...state.timer,
        isRunning: false,
        isPaused: false,
        startTime: null,
        durationSeconds: durationMins * 60,
        elapsedBeforePause: 0
      };
      saveStoredTimerState(updatedTimer);
      return { timer: updatedTimer };
    });

    checkAndPerformRollover();
  },

  resetTimer: () => {
    get().stopTimer();
  },

  tickTimer: () => {
    const { timer, settings, tasks, addSession, updateTask, checkAndPerformRollover } = get();
    if (!timer.isRunning || !timer.startTime) return;

    const currentElapsed = timer.elapsedBeforePause + Math.floor((Date.now() - timer.startTime) / 1000);
    const remaining = Math.max(0, timer.durationSeconds - currentElapsed);

    if (remaining === 0) {
      // SESSION FINISHED!
      const activeTask = tasks.find(t => t.id === timer.activeTaskId);
      const sessionDurationMins = Math.round(timer.durationSeconds / 60);

      // 1. Record session
      addSession({
        taskId: activeTask?.id || 'none',
        taskName: activeTask?.name || 'General Task',
        taskColor: activeTask?.color || '#3b82f6',
        date: getTodayDateString(),
        startTime: timer.startTime - timer.elapsedBeforePause * 1000,
        endTime: Date.now(),
        durationMinutes: sessionDurationMins,
        sessionType: timer.sessionType,
        completed: true,
        interrupted: false
      });

      // 2. Increment task completedPomodoros if work session
      if (timer.sessionType === 'work' && activeTask) {
        updateTask(activeTask.id, {
          completedPomodoros: activeTask.completedPomodoros + 1,
          lastWorkedDate: new Date().toISOString()
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // 3. Ring Alarm & Notifications
      const sound = settings.alarmSound;
      const volume = settings.alarmVolume;
      startAlarmLoop(sound, volume);
      startTabTitleFlash(timer.sessionType === 'work' ? "🎉 Work Finished!" : "☕ Break Finished!");

      if (settings.notificationEnabled) {
        sendDesktopNotification(
          timer.sessionType === 'work' ? "Focus Session Completed!" : "Break Finished!",
          timer.sessionType === 'work' ? "Great job! Time for a well-deserved break." : "Ready to get back in the flow?"
        );
      }

      // 4. Determine next phase
      const currentPreset = settings.presets.find(p => p.id === settings.activePresetId) || settings.presets[0];
      let nextType: SessionType = 'work';
      let nextCycle = timer.currentCycle;

      if (timer.sessionType === 'work') {
        if (timer.currentCycle >= currentPreset.sessionsBeforeLongBreak) {
          nextType = 'longBreak';
          nextCycle = 1;
        } else {
          nextType = 'shortBreak';
        }
      } else {
        nextType = 'work';
        if (timer.sessionType === 'shortBreak') {
          nextCycle = timer.currentCycle + 1;
        }
      }

      const nextDurationMins = nextType === 'work' 
        ? currentPreset.workDuration 
        : nextType === 'shortBreak' 
          ? currentPreset.shortBreakDuration 
          : currentPreset.longBreakDuration;

      const autoStart = nextType === 'work' ? currentPreset.autoStartWork : currentPreset.autoStartBreaks;

      set(() => {
        const nextTimer: TimerState = {
          isRunning: autoStart,
          isPaused: false,
          sessionType: nextType,
          startTime: autoStart ? Date.now() : null,
          durationSeconds: nextDurationMins * 60,
          elapsedBeforePause: 0,
          currentCycle: nextCycle,
          activeTaskId: activeTask?.id || null
        };
        saveStoredTimerState(nextTimer);
        return {
          timer: nextTimer,
          isAlarmRinging: true,
          alarmSessionType: timer.sessionType
        };
      });

      // Execute daily rollover check after session end
      checkAndPerformRollover();
    } else {
      // Trigger store update so timer subscribers re-render on each tick
      set((state) => ({
        timer: { ...state.timer }
      }));
    }
  },

  dismissAlarm: () => {
    stopAlarmLoop();
    stopTabTitleFlash();
    set({ isAlarmRinging: false, alarmSessionType: null });
  },

  snoozeAlarm: () => {
    stopAlarmLoop();
    stopTabTitleFlash();
    set((state) => {
      const snoozeTimer: TimerState = {
        ...state.timer,
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        durationSeconds: 5 * 60,
        elapsedBeforePause: 0
      };
      saveStoredTimerState(snoozeTimer);
      return {
        isAlarmRinging: false,
        alarmSessionType: null,
        timer: snoozeTimer
      };
    });
  },

  // Daily Workspace Rollover Check
  checkAndPerformRollover: async () => {
    const { timer, tasks, templates, settings, pendingRollover } = get();
    const todayStr = getTodayDateString();
    const lastRollover = await getLastRolloverDate();

    const needsRollover = lastRollover !== todayStr || pendingRollover;
    if (!needsRollover) return;

    // Do NOT perform rollover while timer is running
    if (timer.isRunning) {
      set({ pendingRollover: true });
      return;
    }

    // Archive tasks from previous days
    let updatedTasks = tasks.map(t => {
      if (t.date !== todayStr && !t.archived) {
        return { ...t, archived: true };
      }
      return t;
    });

    // Populate default template if today has no active tasks
    const todayTasks = updatedTasks.filter(t => t.date === todayStr);
    if (todayTasks.length === 0 && settings.defaultTemplateId) {
      const defTemp = templates.find(t => t.id === settings.defaultTemplateId);
      if (defTemp) {
        const newTasks: Task[] = defTemp.tasks.map((t, idx) => ({
          id: `task-rollover-${Date.now()}-${idx}`,
          name: t.name,
          color: t.color,
          estimatedPomodoros: t.estimatedPomodoros,
          completedPomodoros: 0,
          notes: t.notes || '',
          archived: false,
          createdAt: new Date().toISOString(),
          date: todayStr,
          order: idx
        }));
        updatedTasks = [...updatedTasks, ...newTasks];
      }
    }

    await saveStoredTasks(updatedTasks);
    await setLastRolloverDate(todayStr);

    const newActiveTask = updatedTasks.find(t => !t.archived) || null;

    set((state) => {
      const updatedTimer = { ...state.timer, activeTaskId: newActiveTask?.id || null };
      saveStoredTimerState(updatedTimer);
      return {
        tasks: updatedTasks,
        activeTaskId: newActiveTask?.id || null,
        timer: updatedTimer,
        pendingRollover: false
      };
    });
  }
}));
