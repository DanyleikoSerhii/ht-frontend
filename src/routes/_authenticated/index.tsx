import { createFileRoute } from '@tanstack/react-router';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';

import { useAuth } from '@/features/auth/hooks';
import { DateSwitcher } from '@/features/entries/components/date-switcher';
import { TodayList } from '@/features/entries/components/today-list';
import { useUiStore } from '@/shared/stores/ui-store';

export const Route = createFileRoute('/_authenticated/')({
  component: TodayPage,
});

function TodayPage() {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const auth = useAuth();
  const name = auth.data?.user?.name?.split(' ')[0] ?? 'friend';

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
            value="7"
            unit="days"
          />
          <KpiTile
            tone="mint"
            icon={<Sparkles className="size-4" />}
            label="Today done"
            value="3"
            unit="of 5"
          />
          <KpiTile
            tone="blue"
            icon={<TrendingUp className="size-4" />}
            label="This week"
            value="86%"
            unit="completion"
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
  value: string;
  unit: string;
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

function KpiTile({ tone, icon, label, value, unit }: KpiTileProps) {
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
        <p className="flex items-baseline gap-1.5 font-display">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  );
}
