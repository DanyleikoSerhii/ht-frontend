import { FlameIcon, TrophyIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { type HabitStats } from '@/features/stats/schemas';
import { cn } from '@/lib/utils';

type Props = {
  stats: HabitStats | undefined;
  isLoading: boolean;
};

export function StreakStat({ stats, isLoading }: Props) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-3 gap-3" aria-busy="true" aria-label="Loading streak stats">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatPill
        label="Current streak"
        value={String(stats.currentStreak)}
        icon={<FlameIcon className="size-5 text-orange-500" aria-hidden />}
        highlight
      />
      <StatPill
        label="Best streak"
        value={String(stats.bestStreak)}
        icon={<TrophyIcon className="size-5 text-yellow-500" aria-hidden />}
      />
      <StatPill
        label="30-day rate"
        value={`${Math.round(stats.completionRate * 100)}%`}
        icon={null}
      />
    </div>
  );
}

type StatPillProps = {
  label: string;
  value: string;
  icon: ReactNode;
  highlight?: boolean;
};

function StatPill({ label, value, icon, highlight }: StatPillProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-4 text-center',
        highlight && 'border-primary/40 bg-primary/5',
      )}
    >
      {icon}
      <span className="text-2xl font-bold leading-none tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
