import { type Locale, SUPPORTED_LOCALES } from '@/shared/lib/i18n';
import { usePrefsStore } from '@/shared/stores/prefs-store';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
};

export function LanguageSelect() {
  const current = usePrefsStore((s) => s.locale);
  const setLocale = usePrefsStore((s) => s.setLocale);

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex rounded-lg border border-border bg-muted p-0.5"
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => setLocale(locale)}
          aria-pressed={current === locale}
          className={cn(
            'min-w-10 rounded-md px-3 py-1 text-sm font-medium transition-colors',
            current === locale
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
