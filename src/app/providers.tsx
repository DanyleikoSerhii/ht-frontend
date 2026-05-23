import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { router } from '@/app/router';
import { getI18n } from '@/shared/lib/i18n';
import { usePrefsStore } from '@/shared/stores/prefs-store';
import { Toaster } from '@/shared/ui/sonner';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

function PrefsSync() {
  const locale = usePrefsStore((s) => s.locale);
  const theme = usePrefsStore((s) => s.theme);
  const { setTheme } = useTheme();

  useEffect(() => {
    void getI18n().changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return null;
}

const i18n = getI18n();

export function AppProviders() {
  const [queryClient] = useState(createQueryClient);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <PrefsSync />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} context={{ queryClient }} />
          <Toaster />
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
