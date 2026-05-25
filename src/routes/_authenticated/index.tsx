import { createFileRoute } from '@tanstack/react-router';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { useAuth } from '@/features/auth/hooks';
import { DateSwitcher } from '@/features/entries/components/date-switcher';
import { TodayList } from '@/features/entries/components/today-list';
import { useTodayItems } from '@/features/entries/hooks';
import { type TodayItem } from '@/features/entries/schemas';
import { useDashboardSummary } from '@/features/stats/hooks';
import { type DashboardSummary } from '@/features/stats/schemas';
import { useUiStore } from '@/shared/stores/ui-store';

export const Route = createFileRoute('/_authenticated/')({
  component: TodayPage,
});

function TodayPage() {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const auth = useAuth();
  const today = useTodayItems(selectedDate);
  const summary = useDashboardSummary('7d');

  const name = auth.data?.user?.name?.split(' ')[0] ?? 'friend';

  const { done, total } = useMemo(() => countDone(today.data), [today.data]);
  const weeklyPct = useMemo(() => formatPercent(summary.data?.avgCompletionRate), [summary.data]);
  const currentStreak = useMemo(() => maxStreak(summary.data), [summary.data]);

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">{greeting()}</p>
            <h1 className="font-display text-[2rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
              Hey {name}, let&rsquo;s grow today.
            </h1>
          </div>
          <DateSwitcher />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <KpiTile
            tone="peach"
            icon={<Flame className="size-4" />}
            label="Current streak"
            value={currentStreak !== null ? String(currentStreak) : null}
            unit={currentStreak === 1 ? 'day' : 'days'}
            isLoading={summary.isLoading}
          />
          <KpiTile
            tone="mint"
            icon={<Sparkles className="size-4" />}
            label="Today done"
            value={today.data ? String(done) : null}
            unit={today.data ? `of ${total}` : ''}
            isLoading={today.isLoading}
          />
          <KpiTile
            tone="blue"
            icon={<TrendingUp className="size-4" />}
            label="This week"
            value={weeklyPct}
            unit="completion"
            isLoading={summary.isLoading}
          />
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg tracking-tight text-foreground/80">Today</h2>
        <TodayList date={selectedDate} />
      </section>
    </div>
  );
}

function isItemDone(item: TodayItem): boolean {
  if (!item.entry) return false;
  return item.entry.count >= item.targetPerDay;
}

function countDone(items: TodayItem[] | undefined): { done: number; total: number } {
  if (!items) return { done: 0, total: 0 };
  const due = items.filter((i) => i.isDue);
  return { done: due.filter(isItemDone).length, total: due.length };
}

function maxStreak(summary: DashboardSummary | undefined): number | null {
  if (!summary) return null;
  if (summary.habits.length === 0) return 0;
  return summary.habits.reduce((acc, h) => Math.max(acc, h.currentStreak), 0);
}

function formatPercent(rate: number | undefined): string | null {
  if (rate === undefined) return null;
  return `${Math.round(rate * 100)}%`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Goodnight';
}

type KpiTileProps = {
  tone: 'peach' | 'mint' | 'blue';
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit: string;
  isLoading: boolean;
};

const TONE_FG: Record<KpiTileProps['tone'], string> = {
  peach: 'var(--color-peach)',
  mint: 'var(--color-mint)',
  blue: 'var(--color-blueberry)',
};

const TONE_SOFT: Record<KpiTileProps['tone'], string> = {
  peach: 'var(--color-peach-soft)',
  mint: 'var(--color-mint-soft)',
  blue: 'var(--color-blueberry-soft)',
};

function KpiTile({ tone, icon, label, value, unit, isLoading }: KpiTileProps) {
  return (
    <div className="app-tile calm flex items-center gap-3 p-4">
      <span
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ background: TONE_SOFT[tone], color: TONE_FG[tone] }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded-md bg-muted" />
        ) : (
          <p className="flex items-baseline gap-1.5 font-display">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {value ?? '—'}
            </span>
            {unit && value !== null && (
              <span className="text-xs text-muted-foreground">{unit}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
