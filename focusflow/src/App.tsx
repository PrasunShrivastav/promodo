import React, { useEffect, useState } from 'react';
import { usePomodoroStore } from './store/usePomodoroStore';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TaskList } from './components/Tasks/TaskList';
import { ReportsView } from './components/Reports/ReportsView';
import { TemplateManager } from './components/Templates/TemplateManager';
import { HistoryView } from './components/History/HistoryView';
import { SettingsView } from './components/Settings/SettingsView';
import { AlarmModal } from './components/Timer/AlarmModal';
import { MiniFloatingTimer } from './components/Timer/MiniFloatingTimer';
import { GlobalTimerEngine } from './components/Timer/GlobalTimerEngine';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutHelpModal } from './components/ShortcutHelpModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Clock } from 'lucide-react';

function MainAppContent() {
  const activeTab = usePomodoroStore(state => state.activeTab);
  const settings = usePomodoroStore(state => state.settings);
  const setShortcutModalOpen = usePomodoroStore(state => state.setShortcutModalOpen);
  const initializeStore = usePomodoroStore(state => state.initializeStore);
  const isInitialized = usePomodoroStore(state => state.isInitialized);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize store asynchronously from IndexedDB
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Initial Theme Setup & PWA Listeners
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA ServiceWorker registration skipped:', err);
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '?') {
        e.preventDefault();
        setShortcutModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [settings.theme, setShortcutModalOpen]);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center animate-pulse">
          <Clock className="w-6 h-6 animate-spin" />
        </div>
        <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          Initializing IndexedDB Data Layer...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col selection:bg-rose-500/20 selection:text-rose-500">
      
      {/* Global Background Timer Loop & Tab Title Engine */}
      <GlobalTimerEngine />

      {/* Top Navbar Header */}
      <Navbar 
        deferredPrompt={deferredPrompt} 
        onInstallPWA={handleInstallPWA} 
      />

      {/* Main View Area */}
      <main className="flex-1 pb-20">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'tasks' && <TaskList />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'templates' && <TemplateManager />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Mini Timer when navigating */}
      <MiniFloatingTimer />

      {/* Ringing Alarm Fullscreen Overlay */}
      <AlarmModal />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette />

      {/* Keyboard Shortcuts Modal (?) */}
      <ShortcutHelpModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainAppContent />
    </ErrorBoundary>
  );
}
