import { create } from 'zustand';
import { api, ApiError } from '../api/client';
import { loadSettings, saveSettings, type Settings } from '../lib/settings';
import type { GameState, User } from '../types';

type Phase = 'boot' | 'anonymous' | 'ready';

interface AppStore {
  phase: Phase;
  user: User | null;
  game: GameState | null;
  error: string | null;
  settings: Settings;
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
  setError: (message: string | null) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  phase: 'boot',
  user: null,
  game: null,
  error: null,
  settings: loadSettings(),

  bootstrap: async () => {
    try {
      const { user } = await api.session();
      if (!user) {
        set({ phase: 'anonymous', user: null, game: null });
        return;
      }
      const game = await api.state();
      set({ phase: 'ready', user, game, error: null });
    } catch (error) {
      set({
        phase: 'anonymous',
        error: error instanceof ApiError ? error.message : 'No pudimos hablar con la isla.',
      });
    }
  },

  login: async (username, password) => {
    set({ error: null });
    const { user } = await api.login(username, password);
    const game = await api.state();
    set({ phase: 'ready', user, game, error: null });
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ phase: 'anonymous', user: null, game: null, error: null });
    }
  },

  refresh: async () => {
    if (!get().user) return;
    const game = await api.state();
    set({ game });
  },

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    saveSettings(next);
    set({ settings: next });
  },

  setError: (message) => set({ error: message }),
}));
