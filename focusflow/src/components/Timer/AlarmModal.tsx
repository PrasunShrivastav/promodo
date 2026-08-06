import React from 'react';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { BellRing, Volume2, Clock, CheckCircle } from 'lucide-react';

export const AlarmModal: React.FC = () => {
  const { 
    isAlarmRinging, 
    alarmSessionType, 
    dismissAlarm, 
    snoozeAlarm 
  } = usePomodoroStore();

  if (!isAlarmRinging) return null;

  const isWorkFinished = alarmSessionType === 'work';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        
        {/* Animated Sound Wave / Bell Glow Header */}
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-75" />
          <BellRing className="w-10 h-10 relative z-10 animate-bounce" />
        </div>

        {/* Alarm Title */}
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
          {isWorkFinished ? '🎉 Focus Session Complete!' : '☕ Break Finished!'}
        </h2>

        {/* Alarm Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-xs mx-auto">
          {isWorkFinished
            ? 'Awesome work! Take a breath and step away from the screen.'
            : 'Ready to get back into deep focus and conquer your next task?'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Stop Alarm */}
          <button
            onClick={dismissAlarm}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Stop Alarm</span>
          </button>

          {/* Snooze (5 minutes) */}
          <button
            onClick={snoozeAlarm}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-semibold text-sm transition-all active:scale-95"
          >
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>Snooze 5m</span>
          </button>
        </div>

        {/* Sound Notice */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
          <span>Alarm sound ringing...</span>
        </div>
      </div>
    </div>
  );
};
