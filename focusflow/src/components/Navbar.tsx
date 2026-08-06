import React, { useMemo } from 'react';
import { usePomodoroStore, ActiveTab } from '../store/usePomodoroStore';
import { 
  Timer, 
  CheckSquare, 
  BarChart3, 
  Layers, 
  History, 
  Settings as SettingsIcon, 
  Flame, 
  Search, 
  Moon, 
  Sun,
  Keyboard,
  Download
} from 'lucide-react';
import { calculateStreaks } from '../utils/analytics';

interface NavbarProps {
  deferredPrompt: any;
  onInstallPWA: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ deferredPrompt, onInstallPWA }) => {
  const activeTab = usePomodoroStore(state => state.activeTab);
  const setActiveTab = usePomodoroStore(state => state.setActiveTab);
  const settings = usePomodoroStore(state => state.settings);
  const updateSettings = usePomodoroStore(state => state.updateSettings);
  const sessions = usePomodoroStore(state => state.sessions);
  const setCommandPaletteOpen = usePomodoroStore(state => state.setCommandPaletteOpen);
  const setShortcutModalOpen = usePomodoroStore(state => state.setShortcutModalOpen);

  const { currentStreak } = useMemo(() => calculateStreaks(sessions), [sessions]);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Layers className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xl"
            aria-label="ChronoFocus Studio - Go to Timer"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-mono font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div>
              <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-none block">
                ChronoFocus
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none block mt-0.5">
                Studio
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/70 dark:bg-zinc-900/70 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs border border-zinc-200/50 dark:border-zinc-700/50'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Streak Indicator */}
          <div 
            title={`Current Focus Streak: ${currentStreak} day(s)`}
            aria-label={`Current streak: ${currentStreak} days`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{currentStreak}d</span>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Open command palette"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              ⌘K
            </kbd>
          </button>

          {/* Keyboard shortcuts trigger */}
          <button
            onClick={() => setShortcutModalOpen(true)}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard Shortcuts"
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onInstallPWA}
              aria-label="Install Progressive Web App"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle dark and light theme"
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/90 py-1 px-2" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';
