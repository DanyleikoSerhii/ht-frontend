import { Flame, Sparkles, Target } from 'lucide-react';

import { type DashboardSummary } from '@/features/stats/schemas';

type Props = {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
};

type Tone = 'peach' | 'mint' | 'blue';

type Kpi = {
  tone: Tone;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
};

const TONE_FG: Record<Tone, string> = {
  peach: 'var(--color-peach)',
  mint: 'var(--color-mint)',
  blue: 'var(--color-blueberry)',
};
const TONE_SOFT: Record<Tone, string> = {
  peach: 'var(--color-peach-soft)',
  mint: 'var(--color-mint-soft)',
  blue: 'var(--color-blueberry-soft)',
};

export function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="app-tile shimmer h-20" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="app-tile flex h-20 items-center justify-center text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const cards: Kpi[] = [
    {
      tone: 'peach',
      icon: <Target className="size-4" />,
      label: 'Active habits',
      value: String(summary.activeHabits),
    },
    {
      tone: 'mint',
      icon: <Sparkles className="size-4" />,
      label: 'Completion',
      value: `${Math.round(summary.avgCompletionRate * 100)}%`,
      sub: 'this period',
    },
    {
      tone: 'blue',
      icon: <Flame className="size-4" />,
      label: 'Top streak',
      value: String(Math.max(0, ...summary.habits.map((h) => h.currentStreak))),
      sub: 'days',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <KpiCard key={c.label} kpi={c} />
      ))}
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="app-tile calm flex items-center gap-3 p-4">
      <span
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ background: TONE_SOFT[kpi.tone], color: TONE_FG[kpi.tone] }}
      >
        {kpi.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
        <p className="flex items-baseline gap-1.5 font-display tracking-tight">
          <span className="text-2xl font-semibold tabular-nums">{kpi.value}</span>
          {kpi.sub && <span className="text-xs text-muted-foreground">{kpi.sub}</span>}
        </p>
      </div>
    </div>
  );
}
