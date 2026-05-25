import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import { usePrefsStore } from '@/shared/stores/prefs-store';
import { Button } from '@/shared/ui/button';

const ORDER = ['light', 'dark', 'system'] as const;
type ThemeMode = (typeof ORDER)[number];

const ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const theme = usePrefsStore((s) => s.theme);
  const setStoredTheme = usePrefsStore((s) => s.setTheme);
  const { setTheme } = useTheme();
  const { t } = useTranslation();

  const current: ThemeMode = ORDER.includes(theme as ThemeMode) ? (theme as ThemeMode) : 'system';
  const next: ThemeMode = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? 'system';
  const Icon = ICONS[current];

  function handleToggle() {
    setStoredTheme(next);
    setTheme(next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`${t('settings.theme.label')}: ${t(`settings.theme.${next}`)}`}
      title={t(`settings.theme.${next}`)}
      onClick={handleToggle}
    >
      <Icon className="size-4" />
    </Button>
  );
}
