import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { CompletionTrendChart } from '@/features/stats/components/completion-trend-chart';
import { SummaryCards } from '@/features/stats/components/summary-cards';
import { WeekdayBreakdownChart } from '@/features/stats/components/weekday-breakdown-chart';
import {
  useCompletionTrend,
  useDashboardSummary,
  useWeekdayBreakdown,
} from '@/features/stats/hooks';
import { StatsPeriod } from '@/features/stats/schemas';
import { cn } from '@/lib/utils';

const SearchSchema = z.object({
  period: StatsPeriod.default('30d'),
});

export const Route = createFileRoute('/_authenticated/stats')({
  validateSearch: SearchSchema,
  component: StatsPage,
});

const PERIODS = StatsPeriod.options;

function StatsPage() {
  const { period } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  function setPeriod(p: StatsPeriod) {
    void navigate({ search: (prev) => ({ ...prev, period: p }), replace: true });
  }

  const summary = useDashboardSummary(period);
  const trend = useCompletionTrend(period);
  const breakdown = useWeekdayBreakdown(period);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      <SummaryCards summary={summary.data} isLoading={summary.isLoading} />

      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Completion trend
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <CompletionTrendChart trend={trend.data} isLoading={trend.isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          By day of week
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <WeekdayBreakdownChart breakdown={breakdown.data} isLoading={breakdown.isLoading} />
        </div>
      </div>
    </section>
  );
}

type PeriodSelectorProps = {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
};

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Stats period"
      className="inline-flex rounded-md border border-input p-0.5"
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          role="tab"
          type="button"
          aria-selected={value === p}
          onClick={() => onChange(p)}
          className={cn(
            'rounded px-3 py-1 text-sm font-medium transition-colors',
            value === p
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
