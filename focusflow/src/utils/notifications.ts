let originalTitle = document.title;
let titleFlashInterval: number | null = null;

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied' as NotificationPermission);
  }
  return Notification.requestPermission();
}

export function sendDesktopNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/manifest.json', // browser handles icon or manifest fallback
        requireInteraction: true,
        tag: 'chronofocus-alarm'
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('Desktop notification error:', e);
    }
  }
}

export function startTabTitleFlash(message: string = "🔔 Time's Up!") {
  stopTabTitleFlash();
  originalTitle = document.title || 'ChronoFocus — Pomodoro Productivity Studio';
  let toggle = false;
  titleFlashInterval = window.setInterval(() => {
    document.title = toggle ? message : `⏱️ ${originalTitle}`;
    toggle = !toggle;
  }, 900);
}

export function stopTabTitleFlash() {
  if (titleFlashInterval !== null) {
    clearInterval(titleFlashInterval);
    titleFlashInterval = null;
  }
  document.title = 'ChronoFocus — Pomodoro Productivity Studio';
}

export function updateTabTitleTimer(formattedTime: string, sessionType: string, isRunning: boolean) {
  if (titleFlashInterval !== null) return; // Don't overwrite alarm flash
  const prefix = isRunning ? '▶' : '⏸';
  const label = sessionType === 'work' ? 'Focus' : sessionType === 'shortBreak' ? 'Break' : 'Long Break';
  const nextTitle = `${prefix} (${formattedTime}) ${label} - ChronoFocus`;
  if (document.title !== nextTitle) {
    document.title = nextTitle;
  }
}
