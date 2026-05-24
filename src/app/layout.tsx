import { Link, useNavigate } from '@tanstack/react-router';
import { BarChart3, Flame, LeafyGreen, LogOut, Settings, Sun } from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth, useLogout } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

type NavItem = {
  to: string;
  labelKey: string;
  icon: typeof Sun;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', labelKey: 'nav.today', icon: Sun },
  { to: '/habits', labelKey: 'nav.habits', icon: LeafyGreen },
  { to: '/stats', labelKey: 'nav.stats', icon: BarChart3 },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="app-shell text-foreground">
      {/* Slim glass header */}
      <header className="sticky top-0 z-30 px-4 pt-3 md:px-8 md:pt-4">
        <div className="app-glass mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-3 md:h-14 md:px-4">
          <Link
            to="/"
            className="calm flex items-center gap-2.5 rounded-xl pr-3 pl-1 font-semibold tracking-tight"
          >
            <LogoMark />
            <span className="font-display text-[1rem] leading-none tracking-tight md:text-[1.05rem]">
              Habit&nbsp;Garden
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <StreakChip count={7} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="md:flex md:gap-6 md:px-8 md:pt-6">
        {/* Sidebar (desktop) */}
        <aside
          aria-label="Sidebar navigation"
          className="hidden md:sticky md:top-24 md:block md:h-[calc(100svh-7.5rem)] md:w-56 md:shrink-0 md:py-1"
        >
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>
        </aside>

        <main className="app-main mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:px-2 md:pt-0 md:pb-10">
          <div className="animate-[rise-in_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">{children}</div>
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Bottom navigation"
        className="app-glass fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md justify-around rounded-2xl p-1 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.to} item={item} />
        ))}
      </nav>

      <span className="sr-only">{t('app.name')}</span>
    </div>
  );
}

/* ── Minimal logo mark ─────────────────────────────────────────── */
function LogoMark() {
  return (
    <span
      aria-hidden
      className="inline-flex size-8 items-center justify-center rounded-xl bg-[var(--color-peach-soft)] text-[var(--color-peach)]"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M12 3 C 8 6, 6 9, 8 13 C 10 11, 14 11, 16 13 C 18 9, 16 6, 12 3 Z"
          fill="currentColor"
        />
        <circle cx="12" cy="17" r="4" fill="currentColor" />
      </svg>
    </span>
  );
}

function StreakChip({ count }: { count: number }) {
  return (
    <span className="chip chip-peach hidden h-8 px-2.5 sm:inline-flex">
      <Flame className="size-3.5" />
      <span className="font-semibold tabular-nums">{count}</span>
    </span>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const auth = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const user = auth.data?.user;
  const initial = user?.name.charAt(0).toUpperCase() ?? '?';

  async function handleLogout() {
    await logout.mutateAsync();
    await navigate({ to: '/login', replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('auth.userMenu')}
          className="calm flex size-8 items-center justify-center overflow-hidden rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-[hsl(var(--muted))]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span aria-hidden>{initial}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl p-1">
        {user && (
          <>
            <DropdownMenuLabel className="rounded-lg px-3 py-2 font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          className="gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          onSelect={() => {
            void handleLogout();
          }}
        >
          <LogOut />
          <span>{t('auth.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ACTIVE_GLOW =
  'text-[var(--color-peach)] [&_svg]:drop-shadow-[0_0_10px_color-mix(in_oklab,var(--color-peach)_70%,transparent)] [text-shadow:0_0_12px_color-mix(in_oklab,var(--color-peach)_55%,transparent)]';

function SidebarLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === '/' }}
      className="calm flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/65 hover:text-foreground"
      activeProps={{
        className: cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold',
          ACTIVE_GLOW,
        ),
      }}
    >
      <Icon className="size-4" aria-hidden />
      <span>{t(item.labelKey)}</span>
    </Link>
  );
}

function BottomNavLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === '/' }}
      className="calm flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.65rem] font-medium text-muted-foreground"
      activeProps={{
        className: cn(
          'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.65rem] font-semibold',
          ACTIVE_GLOW,
        ),
      }}
    >
      <Icon className="size-5" aria-hidden />
      <span className="max-w-full truncate leading-none">{t(item.labelKey)}</span>
    </Link>
  );
}
