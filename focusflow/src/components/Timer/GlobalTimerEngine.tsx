import React, { useEffect } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { updateTabTitleTimer } from '../../utils/notifications';

export const GlobalTimerEngine: React.FC = () => {
  const timer = usePomodoroStore(state => state.timer);
  const tickTimer = usePomodoroStore(state => state.tickTimer);

  // Global Tick Loop - runs every 1000ms regardless of active view
  useEffect(() => {
    // Initial tab title update when paused / idle
    const updateTitle = () => {
      const currentElapsed = timer.elapsedBeforePause + (timer.isRunning && timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0);
      const remainingSeconds = Math.max(0, timer.durationSeconds - currentElapsed);
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      updateTabTitleTimer(formattedTime, timer.sessionType, timer.isRunning);
    };

    updateTitle();

    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      tickTimer();
      updateTitle();
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, timer.startTime, timer.elapsedBeforePause, timer.durationSeconds, timer.sessionType, tickTimer]);

  return null;
};
