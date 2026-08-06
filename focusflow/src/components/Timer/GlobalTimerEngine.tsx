import React, { useEffect } from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { updateTabTitleTimer } from '../../utils/notifications';

export const GlobalTimerEngine: React.FC = () => {
  const timer = usePomodoroStore(state => state.timer);
  const tickTimer = usePomodoroStore(state => state.tickTimer);

  // Global Tick Loop - runs regardless of which tab is active
  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 500);
    return () => clearInterval(interval);
  }, [timer.isRunning, tickTimer]);

  // Global Tab Title Sync - keeps browser title up to date with exact countdown time
  useEffect(() => {
    const currentElapsed = timer.elapsedBeforePause + (timer.isRunning && timer.startTime ? Math.floor((Date.now() - timer.startTime) / 1000) : 0);
    const remainingSeconds = Math.max(0, timer.durationSeconds - currentElapsed);
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    updateTabTitleTimer(formattedTime, timer.sessionType, timer.isRunning);
  }, [timer]);

  return null;
};
