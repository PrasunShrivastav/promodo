import { AlarmSound } from '../types';

let audioCtx: AudioContext | null = null;
let alarmInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes alarm sound using Web Audio API
 */
export function playSoundNote(soundType: AlarmSound, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1.0, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (soundType === 'zen') {
      // Warm resonant Tibetan singing bowl / zen gong tone
      const freqs = [220, 440, 660, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const weight = 1 / (idx + 1);
        gain.gain.setValueAtTime(0.3 * weight, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } else if (soundType === 'digital') {
      // Clean modern dual beep
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + delay);
        osc.frequency.setValueAtTime(1760, now + delay + 0.05);

        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
    } else if (soundType === 'marimba') {
      // Pleasant marimba chord sequence
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const delay = idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 0.8);
      });
    } else {
      // Soft Bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 1.5); // D5

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.8);
    }
  } catch (err) {
    console.error('Audio playback failed', err);
  }
}

/**
 * Rings continuously until stopped
 */
export function startAlarmLoop(soundType: AlarmSound, volume: number = 0.8) {
  stopAlarmLoop();
  playSoundNote(soundType, volume);

  const intervalTime = soundType === 'zen' ? 3200 : soundType === 'marimba' ? 2200 : 1500;
  alarmInterval = window.setInterval(() => {
    playSoundNote(soundType, volume);
  }, intervalTime);
}

export function stopAlarmLoop() {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}
