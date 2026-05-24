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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">Your progress</p>
          <h1 className="font-display text-[2rem] leading-tight tracking-tight sm:text-[2.4rem]">
            Statistics
          </h1>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      <SummaryCards summary={summary.data} isLoading={summary.isLoading} />

      <ChartBlock title="Completion trend">
        <CompletionTrendChart trend={trend.data} isLoading={trend.isLoading} />
      </ChartBlock>

      <ChartBlock title="By day of week">
        <WeekdayBreakdownChart breakdown={breakdown.data} isLoading={breakdown.isLoading} />
      </ChartBlock>
    </section>
  );
}

function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h2 className="px-1 text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="app-tile p-5">{children}</div>
    </div>
  );
}

type PeriodSelectorProps = {
  value: StatsPeriod;
  onChange: (p: StatsPeriod) => void;
};

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div role="tablist" aria-label="Stats period" className="inline-flex rounded-full bg-muted p-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          role="tab"
          type="button"
          aria-selected={value === p}
          onClick={() => onChange(p)}
          className={cn(
            'calm rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === p
              ? 'bg-card text-foreground shadow-[0_1px_2px_rgba(34,32,58,0.06)]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
