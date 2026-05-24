import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import { usePrefsStore } from '@/shared/stores/prefs-store';
import { Button } from '@/shared/ui/button';

export function ThemeToggle() {
  const theme = usePrefsStore((s) => s.theme);
  const setStoredTheme = usePrefsStore((s) => s.setTheme);
  const { setTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const Icon = isDark ? Sun : Moon;

  function handleToggle() {
    setStoredTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`${t('settings.theme.label')}: ${t(`settings.theme.${nextTheme}`)}`}
      title={t(`settings.theme.${nextTheme}`)}
      onClick={handleToggle}
    >
      <Icon className="size-4" />
    </Button>
  );
}
