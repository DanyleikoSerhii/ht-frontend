import { type DashboardSummary } from '@/features/stats/schemas';
import { cn } from '@/lib/utils';

type Props = {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
};

export function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  const cards: Array<{ label: string; value: string; sub?: string }> = [
    { label: 'Active habits', value: String(summary.activeHabits) },
    {
      label: 'Completion rate',
      value: `${Math.round(summary.avgCompletionRate * 100)}%`,
      sub: 'this period',
    },
    {
      label: 'Top streak',
      value: String(Math.max(0, ...summary.habits.map((h) => h.currentStreak))),
      sub: 'days (active)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ label, value, sub }) => (
        <KpiCard key={label} label={label} value={value} sub={sub} />
      ))}
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  className?: string;
};

function KpiCard({ label, value, sub, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3',
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold leading-none tabular-nums">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}
