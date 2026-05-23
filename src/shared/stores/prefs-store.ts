import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Locale } from '@/shared/lib/i18n';

type Theme = 'light' | 'dark' | 'system';

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
    { name: 'ht-prefs' },
  ),
);
