import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Locale } from '@/shared/lib/i18n';

type Theme = 'light' | 'dark';

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
      theme: 'light',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ht-prefs',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<PrefsState> | undefined;
        return {
          locale: state?.locale === 'en' ? 'en' : 'ru',
          theme: state?.theme === 'dark' ? 'dark' : 'light',
        };
      },
    },
  ),
);
