export interface Settings {
  sound: boolean;
  voice: boolean;
  reduceMotion: boolean;
  textScale: number;
  highContrast: boolean;
  showJoystick: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: false,
  reduceMotion: false,
  textScale: 1,
  highContrast: false,
  showJoystick: false,
};

const STORAGE_KEY = 'sqlquest.settings.v1';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // El navegador puede bloquear el almacenamiento; no es crítico.
  }
}
