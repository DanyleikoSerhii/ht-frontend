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
    <div className="mx-auto max-w-xl space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">Preferences</p>
        <h1 className="font-display text-[2rem] leading-tight tracking-tight sm:text-[2.4rem]">
          {t('settings.title')}
        </h1>
      </header>

      <section aria-labelledby="settings-theme-heading" className="app-tile space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h2 id="settings-theme-heading" className="font-display text-base tracking-tight">
              {t('settings.theme.label')}
            </h2>
            <p className="text-xs text-muted-foreground">Light or dark interface.</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section aria-labelledby="settings-lang-heading" className="app-tile space-y-3 p-5">
        <div className="space-y-0.5">
          <h2 id="settings-lang-heading" className="font-display text-base tracking-tight">
            {t('settings.language.label')}
          </h2>
          <p className="text-xs text-muted-foreground">Interface language.</p>
        </div>
        <LanguageSelect />
      </section>

      <section aria-labelledby="settings-account-heading" className="app-tile space-y-3 p-5">
        <div className="space-y-0.5">
          <h2 id="settings-account-heading" className="font-display text-base tracking-tight">
            {t('settings.account.label')}
          </h2>
          {user && <p className="text-xs text-muted-foreground">{user.email}</p>}
        </div>
        <Button
          variant="outline"
          disabled={logout.isPending}
          onClick={() => {
            void handleLogout();
          }}
          className="text-destructive hover:bg-destructive/5 hover:text-destructive"
        >
          {t('settings.account.logout')}
        </Button>
      </section>
    </div>
  );
}
