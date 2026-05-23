import { Link } from '@tanstack/react-router';
import { Activity, BarChart3, CalendarDays, Settings } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Activity;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: '/', label: 'Today', icon: CalendarDays },
  { to: '/habits', label: 'Habits', icon: Activity },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block size-6 rounded bg-primary text-primary-foreground"
          />
          <span>Habit Tracker</span>
        </Link>
        <button type="button" aria-label="User menu" className="size-8 rounded-full bg-muted" />
      </header>

      <div className="md:flex">
        <aside
          aria-label="Sidebar navigation"
          className="hidden md:sticky md:top-14 md:block md:h-[calc(100svh-3.5rem)] md:w-56 md:shrink-0 md:border-r md:border-border md:p-4"
        >
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>
        </aside>

        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-10">
          {children}
        </main>
      </div>

      <nav
        aria-label="Bottom navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavLink key={item.to} item={item} />
        ))}
      </nav>
    </div>
  );
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === '/' }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      activeProps={{
        className: cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-accent text-accent-foreground',
        ),
      }}
    >
      <Icon className="size-4" aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

function BottomNavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === '/' }}
      className="flex flex-col items-center justify-center gap-1 py-2 text-xs text-muted-foreground"
      activeProps={{
        className: cn(
          'flex flex-col items-center justify-center gap-1 py-2 text-xs text-foreground',
        ),
      }}
    >
      <Icon className="size-5" aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}
