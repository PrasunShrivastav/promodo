/**
 * Lightweight pure-DOM confetti effect.
 * Replaces canvas-confetti (~6KB) with ~30 lines of CSS animation.
 * Spawns colored div particles that float and fade via CSS keyframes.
 */

const CONFETTI_COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

let styleInjected = false;

function injectStyles() {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cf-fall {
      0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
      100% { opacity: 0; transform: translateY(120vh) rotate(720deg) scale(0.3); }
    }
    .cf-particle {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      animation: cf-fall var(--cf-dur) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

export function fireConfetti(options?: { particleCount?: number; spread?: number; origin?: { y?: number } }) {
  injectStyles();

  const count = options?.particleCount ?? 60;
  const spread = options?.spread ?? 70;
  const originY = options?.origin?.y ?? 0.6;
  const container = document.createElement('div');
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cf-particle';

    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size = 6 + Math.random() * 6;
    const startX = 50 + (Math.random() - 0.5) * spread;
    const dur = 1.5 + Math.random() * 1.5;

    el.style.cssText = `
      left: ${startX}%;
      top: ${originY * 100}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --cf-dur: ${dur}s;
    `;

    container.appendChild(el);
  }

  // Self-cleanup after animation completes
  setTimeout(() => {
    container.remove();
  }, 3500);
}
