let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export type ToneKind = 'ok' | 'error' | 'star' | 'click';

/** Sonidos sintetizados: sin archivos externos ni licencias dudosas. */
export function playTone(kind: ToneKind, enabled: boolean): void {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes: Record<ToneKind, { freq: number; duration: number; delay: number }[]> = {
    click: [{ freq: 520, duration: 0.06, delay: 0 }],
    ok: [
      { freq: 523.25, duration: 0.12, delay: 0 },
      { freq: 659.25, duration: 0.16, delay: 0.1 },
    ],
    error: [
      { freq: 220, duration: 0.18, delay: 0 },
      { freq: 174.61, duration: 0.2, delay: 0.12 },
    ],
    star: [
      { freq: 523.25, duration: 0.1, delay: 0 },
      { freq: 659.25, duration: 0.1, delay: 0.09 },
      { freq: 783.99, duration: 0.14, delay: 0.18 },
      { freq: 1046.5, duration: 0.2, delay: 0.28 },
    ],
  };

  for (const note of notes[kind]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.0001, now + note.delay);
    gain.gain.exponentialRampToValueAtTime(0.16, now + note.delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + note.delay);
    oscillator.stop(now + note.delay + note.duration + 0.02);
  }
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, enabled: boolean): void {
  if (!enabled || !canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith('es'));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
