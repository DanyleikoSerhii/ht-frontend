import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useAuth, useLogout } from '@/features/auth/hooks';
import { Button } from '@/shared/ui/button';
import { LanguageSelect } from '@/shared/ui/language-select';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const user = auth.data?.user;

  async function handleLogout() {
    await logout.mutateAsync();
    await navigate({ to: '/login', replace: true });
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>

      <section aria-labelledby="settings-theme-heading" className="space-y-3">
        <h2
          id="settings-theme-heading"
          className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
        >
          {t('settings.theme.label')}
        </h2>
        <ThemeToggle />
      </section>

      <section aria-labelledby="settings-lang-heading" className="space-y-3">
        <h2
          id="settings-lang-heading"
          className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
        >
          {t('settings.language.label')}
        </h2>
        <LanguageSelect />
      </section>

      <section aria-labelledby="settings-account-heading" className="space-y-3">
        <h2
          id="settings-account-heading"
          className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
        >
          {t('settings.account.label')}
        </h2>
        {user && <p className="text-sm text-muted-foreground">{user.email}</p>}
        <Button
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => {
            void handleLogout();
          }}
        >
          {t('settings.account.logout')}
        </Button>
      </section>
    </div>
  );
}
