import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserSettings, Task, Template, SessionRecord, TimerState } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_TEMPLATES, DEFAULT_PRESETS } from './constants';
import { getTodayDateString } from './analytics';

const DB_NAME = 'chronofocus_db';
const DB_VERSION = 1;

interface ChronoFocusDB extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
  tasks: {
    key: string;
    value: Task;
  };
  templates: {
    key: string;
    value: Template;
  };
  sessions: {
    key: string;
    value: SessionRecord;
  };
  timer: {
    key: string;
    value: TimerState;
  };
  meta: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<ChronoFocusDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ChronoFocusDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ChronoFocusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('timer')) {
          db.createObjectStore('timer');
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      },
    });
  }
  return dbPromise;
}

// LocalStorage Migration Keys
const LEGACY_KEYS = {
  SETTINGS: 'chronofocus_settings_v2',
  TASKS: 'chronofocus_tasks_v2',
  TEMPLATES: 'chronofocus_templates_v2',
  SESSIONS: 'chronofocus_sessions_v2',
  TIMER: 'chronofocus_timer_v2'
};

export async function migrateLocalStorageToIDB(): Promise<void> {
  try {
    const db = await getDB();
    const migrated = await db.get('meta', 'migrated_from_localstorage');
    if (migrated) return;

    // Load legacy data if present
    const legacySettings = localStorage.getItem(LEGACY_KEYS.SETTINGS);
    const legacyTasks = localStorage.getItem(LEGACY_KEYS.TASKS);
    const legacyTemplates = localStorage.getItem(LEGACY_KEYS.TEMPLATES);
    const legacySessions = localStorage.getItem(LEGACY_KEYS.SESSIONS);
    const legacyTimer = localStorage.getItem(LEGACY_KEYS.TIMER);

    if (legacySettings) {
      try {
        await db.put('settings', JSON.parse(legacySettings), 'user_settings');
      } catch (e) { console.error('Migration error settings:', e); }
    }

    if (legacyTasks) {
      try {
        const tasks: Task[] = JSON.parse(legacyTasks);
        const tx = db.transaction('tasks', 'readwrite');
        for (const t of tasks) {
          await tx.store.put(t);
        }
        await tx.done;
      } catch (e) { console.error('Migration error tasks:', e); }
    }

    if (legacyTemplates) {
      try {
        const templates: Template[] = JSON.parse(legacyTemplates);
        const tx = db.transaction('templates', 'readwrite');
        for (const temp of templates) {
          await tx.store.put(temp);
        }
        await tx.done;
      } catch (e) { console.error('Migration error templates:', e); }
    }

    if (legacySessions) {
      try {
        const sessions: SessionRecord[] = JSON.parse(legacySessions);
        const tx = db.transaction('sessions', 'readwrite');
        for (const s of sessions) {
          await tx.store.put(s);
        }
        await tx.done;
      } catch (e) { console.error('Migration error sessions:', e); }
    }

    if (legacyTimer) {
      try {
        await db.put('timer', JSON.parse(legacyTimer), 'timer_state');
      } catch (e) { console.error('Migration error timer:', e); }
    }

    // Mark migration complete & purge legacy localStorage
    await db.put('meta', true, 'migrated_from_localstorage');
    Object.values(LEGACY_KEYS).forEach(k => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to migrate localStorage to IndexedDB:', err);
  }
}

// Settings Storage Operations
export async function getStoredSettings(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user_settings');
  if (settings) return settings;

  // Initialize with default settings
  await db.put('settings', DEFAULT_SETTINGS, 'user_settings');
  return DEFAULT_SETTINGS;
}

export async function saveStoredSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user_settings');
}

// Tasks Storage Operations
export async function getStoredTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function saveStoredTasks(tasks: Task[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.clear();
  for (const task of tasks) {
    await tx.store.put(task);
  }
  await tx.done;
}

export async function saveStoredTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteStoredTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// Templates Storage Operations
export async function getStoredTemplates(): Promise<Template[]> {
  const db = await getDB();
  const templates = await db.getAll('templates');
  if (templates.length > 0) return templates;

  // Initialize with default templates
  const tx = db.transaction('templates', 'readwrite');
  for (const t of DEFAULT_TEMPLATES) {
    await tx.store.put(t);
  }
  await tx.done;
  return DEFAULT_TEMPLATES;
}

export async function saveStoredTemplates(templates: Template[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('templates', 'readwrite');
  await tx.store.clear();
  for (const t of templates) {
    await tx.store.put(t);
  }
  await tx.done;
}

// Sessions Storage Operations
export async function getStoredSessions(): Promise<SessionRecord[]> {
  const db = await getDB();
  const sessions = await db.getAll('sessions');
  // Return sorted newest first
  return sessions.sort((a, b) => b.startTime - a.startTime);
}

export async function addStoredSession(session: SessionRecord): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function clearStoredSessions(): Promise<void> {
  const db = await getDB();
  await db.clear('sessions');
}

export async function saveStoredSessions(sessions: SessionRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sessions', 'readwrite');
  await tx.store.clear();
  for (const s of sessions) {
    await tx.store.put(s);
  }
  await tx.done;
}

// Timer State Storage Operations
export async function getStoredTimerState(): Promise<TimerState | null> {
  const db = await getDB();
  const timer = await db.get('timer', 'timer_state');
  return timer || null;
}

export async function saveStoredTimerState(timer: TimerState): Promise<void> {
  const db = await getDB();
  await db.put('timer', timer, 'timer_state');
}

// Meta Storage Operations (Rollover Date tracking)
export async function getLastRolloverDate(): Promise<string | null> {
  const db = await getDB();
  return db.get('meta', 'last_rollover_date') || null;
}

export async function setLastRolloverDate(dateStr: string): Promise<void> {
  const db = await getDB();
  await db.put('meta', dateStr, 'last_rollover_date');
}

// Purge all IndexedDB data (for Error Boundary reset option)
export async function purgeAllIDBData(): Promise<void> {
  const db = await getDB();
  await db.clear('settings');
  await db.clear('tasks');
  await db.clear('templates');
  await db.clear('sessions');
  await db.clear('timer');
  await db.clear('meta');
  localStorage.clear();
}
