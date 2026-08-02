import { UserSettings, SoundSpeed } from '../types';

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

// Initialize or resume AudioContext on user gesture
export function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Unit duration based on international standard timing & speed level
export function getUnitDuration(speed: SoundSpeed = '1.0x'): number {
  switch (speed) {
    case '0.5x':
    case 'very-slow':
      return 150; // ms (0.5x speed)
    case '0.75x':
    case 'slow':
      return 100; // ms (0.75x speed)
    case '1.25x':
      return 60;  // ms (1.25x speed)
    case '1.5x':
    case 'fast':
      return 50;  // ms (1.5x speed)
    case '2.0x':
    case 'very-fast':
      return 37;  // ms (2.0x speed)
    case '1.0x':
    case 'normal':
    default:
      return 75;  // ms (1.0x standard speed)
  }
}

// Play single tone with soft envelope
export function playTone(durationMs: number, pitch: number = 600): Promise<void> {
  return new Promise((resolve) => {
    initAudioContext();
    if (!audioCtx) {
      resolve();
      return;
    }

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      const attack = 0.005; // 5ms
      const release = 0.005; // 5ms
      const durSec = Math.max(0.01, durationMs / 1000);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + attack);
      gain.gain.setValueAtTime(0.2, now + durSec - release);
      gain.gain.linearRampToValueAtTime(0, now + durSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      activeOscillators.push(osc);
      osc.start(now);
      osc.stop(now + durSec);

      osc.onended = () => {
        activeOscillators = activeOscillators.filter(o => o !== osc);
        resolve();
      };
    } catch (err) {
      console.warn('Audio playback error:', err);
      resolve();
    }
  });
}

function playToneWithToken(durationMs: number, pitch: number, token: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    if (token.cancelled) {
      resolve();
      return;
    }

    initAudioContext();
    if (!audioCtx) {
      resolve();
      return;
    }

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      const attack = 0.005;
      const release = 0.005;
      const durSec = Math.max(0.01, durationMs / 1000);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + attack);
      gain.gain.setValueAtTime(0.2, now + durSec - release);
      gain.gain.linearRampToValueAtTime(0, now + durSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      activeOscillators.push(osc);
      osc.start(now);
      osc.stop(now + durSec);

      let checkInterval: any = null;

      const finish = () => {
        if (checkInterval) clearInterval(checkInterval);
        activeOscillators = activeOscillators.filter(o => o !== osc);
        resolve();
      };

      osc.onended = finish;

      checkInterval = setInterval(() => {
        if (token.cancelled) {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
          finish();
        }
      }, 10);
    } catch {
      resolve();
    }
  });
}

function delayWithToken(ms: number, token: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    if (token.cancelled) {
      resolve();
      return;
    }
    let elapsed = 0;
    const interval = 10;
    const timer = setInterval(() => {
      elapsed += interval;
      if (token.cancelled || elapsed >= ms) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}

// Play Dot (.)
export function playDot(speed: SoundSpeed = 'normal', pitch: number = 600): Promise<void> {
  const unit = getUnitDuration(speed);
  return playTone(unit, pitch);
}

// Play Dash (-)
export function playDash(speed: SoundSpeed = 'normal', pitch: number = 600): Promise<void> {
  const unit = getUnitDuration(speed);
  return playTone(unit * 3, pitch);
}

// Stop all playing sounds immediately
export function stopAllSounds() {
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {}
  });
  activeOscillators = [];
}

// Play success sound (Duolingo style chime)
export function playSuccessSound(): void {
  initAudioContext();
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

    osc2.frequency.setValueAtTime(1046.5, now + 0.2); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now + 0.2);

    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch {}
}

// Play error sound (low double buzz)
export function playErrorSound(): void {
  initAudioContext();
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
}

// Single execution play helper
export async function playMorseCode(
  code: string, 
  settings: Partial<UserSettings> = {}
): Promise<void> {
  if (settings.soundEnabled === false) return;
  globalMorsePlayer.play(code, settings.soundSpeed || 'normal');
}

// --- Stateful Morse Player Controller ---

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentCode: string;
  speed: SoundSpeed;
  stepIndex: number;
  totalSteps: number;
}

export class MorseAudioController {
  private isPlayingState: boolean = false;
  private isPausedState: boolean = false;
  private currentCode: string = '';
  private speed: SoundSpeed = 'normal';
  private pitch: number = 600;
  private steps: { type: 'dot' | 'dash' | 'pause-element' | 'pause-letter' | 'pause-word'; char: string }[] = [];
  private stepIndex: number = 0;
  private listeners: Set<(state: AudioPlayerState) => void> = new Set();
  private cancelToken: { cancelled: boolean } | null = null;

  constructor(speed: SoundSpeed = 'normal', pitch: number = 600) {
    this.speed = speed;
    this.pitch = pitch;
  }

  public setSpeed(speed: SoundSpeed) {
    this.speed = speed;
    this.notify();
  }

  public getSpeed(): SoundSpeed {
    return this.speed;
  }

  public setPitch(pitch: number) {
    this.pitch = pitch;
  }

  public subscribe(listener: (state: AudioPlayerState) => void) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AudioPlayerState {
    return {
      isPlaying: this.isPlayingState,
      isPaused: this.isPausedState,
      currentCode: this.currentCode,
      speed: this.speed,
      stepIndex: this.stepIndex,
      totalSteps: this.steps.length,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public setCode(code: string) {
    const trimmed = (code || '').trim();
    if (this.currentCode === trimmed && (this.isPlayingState || this.isPausedState)) {
      return;
    }
    this.stop();
    this.currentCode = trimmed;
    this.stepIndex = 0;
    this.parseCode(trimmed);
    this.notify();
  }

  private parseCode(code: string) {
    const symbols = code.split('');
    this.steps = [];

    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (sym === '.') {
        this.steps.push({ type: 'dot', char: '.' });
      } else if (sym === '-') {
        this.steps.push({ type: 'dash', char: '-' });
      } else if (sym === ' ') {
        this.steps.push({ type: 'pause-letter', char: ' ' });
        continue;
      } else if (sym === '/') {
        this.steps.push({ type: 'pause-word', char: '/' });
        continue;
      }

      // Inter-element gap (1 unit) within the same character
      if (i < symbols.length - 1 && symbols[i + 1] !== ' ' && symbols[i + 1] !== '/') {
        this.steps.push({ type: 'pause-element', char: '' });
      }
    }
  }

  public async play(code?: string, speed?: SoundSpeed) {
    if (speed) this.speed = speed;

    if (code !== undefined) {
      const trimmed = code.trim();
      if (this.currentCode !== trimmed) {
        this.setCode(trimmed);
      }
    }

    if (this.steps.length === 0 && this.currentCode) {
      this.parseCode(this.currentCode);
    }

    if (this.steps.length === 0) return;

    // Resume if paused and target code matches
    if (this.isPausedState) {
      this.isPausedState = false;
      this.isPlayingState = true;
      this.notify();
      this.runPlaybackLoop();
      return;
    }

    // Reset token if already running
    if (this.cancelToken) {
      this.cancelToken.cancelled = true;
    }

    if (this.stepIndex >= this.steps.length) {
      this.stepIndex = 0;
    }

    this.isPlayingState = true;
    this.isPausedState = false;
    this.notify();
    this.runPlaybackLoop();
  }

  public pause() {
    if (this.isPlayingState) {
      if (this.cancelToken) {
        this.cancelToken.cancelled = true;
      }
      stopAllSounds();
      this.isPlayingState = false;
      this.isPausedState = true;
      this.notify();
    }
  }

  public stop() {
    if (this.cancelToken) {
      this.cancelToken.cancelled = true;
    }
    stopAllSounds();
    this.isPlayingState = false;
    this.isPausedState = false;
    this.stepIndex = 0;
    this.notify();
  }

  public replay(code?: string, speed?: SoundSpeed) {
    this.stop();
    if (code !== undefined) {
      this.setCode(code);
    }
    this.play(undefined, speed);
  }

  private async runPlaybackLoop() {
    const token = { cancelled: false };
    this.cancelToken = token;

    initAudioContext();

    while (this.stepIndex < this.steps.length && !token.cancelled) {
      const step = this.steps[this.stepIndex];
      const unit = getUnitDuration(this.speed);

      this.notify();

      if (step.type === 'dot') {
        await playToneWithToken(unit, this.pitch, token);
      } else if (step.type === 'dash') {
        await playToneWithToken(unit * 3, this.pitch, token);
      } else if (step.type === 'pause-element') {
        await delayWithToken(unit, token);
      } else if (step.type === 'pause-letter') {
        await delayWithToken(unit * 3, token);
      } else if (step.type === 'pause-word') {
        await delayWithToken(unit * 7, token);
      }

      if (token.cancelled) break;
      this.stepIndex++;
    }

    if (!token.cancelled && this.stepIndex >= this.steps.length) {
      this.isPlayingState = false;
      this.isPausedState = false;
      this.stepIndex = 0;
      this.notify();
    }
  }
}

export const globalMorsePlayer = new MorseAudioController();
