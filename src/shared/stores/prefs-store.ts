import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Locale } from '@/shared/lib/i18n';

type Theme = 'light' | 'dark' | 'system';

const THEMES = ['light', 'dark', 'system'] as const;

function normalizeTheme(value: unknown): Theme {
  return (THEMES as readonly string[]).includes(value as string) ? (value as Theme) : 'system';
}

type PrefsState = {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
};

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      locale: 'ru',
      theme: 'system',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ht-prefs',
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<PrefsState> | undefined;
        return {
          locale: state?.locale === 'en' ? 'en' : 'ru',
          theme: normalizeTheme(state?.theme),
        };
      },
    },
  ),
);
