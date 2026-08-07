import React, { useEffect } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { updateTabTitleTimer } from '../../utils/notifications';

export const GlobalTimerEngine: React.FC = React.memo(() => {
  const isRunning = usePomodoroStore(state => state.timer.isRunning);
  const sessionType = usePomodoroStore(state => state.timer.sessionType);
  const tickTimer = usePomodoroStore(state => state.tickTimer);
  const remainingSeconds = usePomodoroStore(state => state.remainingSeconds);

  // Update tab title whenever remainingSeconds changes
  useEffect(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    updateTabTitleTimer(formattedTime, sessionType, isRunning);
  }, [remainingSeconds, sessionType, isRunning]);

  // Global Tick Loop - runs every 1000ms only when timer is running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);

  return null;
});

GlobalTimerEngine.displayName = 'GlobalTimerEngine';
