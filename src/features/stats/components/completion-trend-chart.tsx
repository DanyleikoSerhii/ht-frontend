import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

import { type CompletionTrend } from '@/features/stats/schemas';

import { ChartContainer, type ChartTooltipProps } from './chart-container';

type Props = {
  trend: CompletionTrend | undefined;
  isLoading: boolean;
};

const ACCENT = '#10b981';
const GRADIENT_ID = 'trendGradient';

function TrendTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const rate = typeof payload[0].value === 'number' ? payload[0].value : 0;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{Math.round(rate * 100)}% completed</p>
    </div>
  );
}

export function CompletionTrendChart({ trend, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-60 animate-pulse rounded-xl bg-muted" />;
  }

  if (!trend || trend.data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const data = trend.data.map((p) => ({
    date: p.date.slice(5), // MM-DD
    rate: p.rate,
  }));

  return (
    <ChartContainer height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
            <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
          tickLine={false}
          axisLine={false}
          domain={[0, 1]}
          width={36}
        />
        <Tooltip
          content={TrendTooltip}
          cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke={ACCENT}
          strokeWidth={3}
          fill={`url(#${GRADIENT_ID})`}
          dot={false}
          activeDot={{ r: 6, fill: ACCENT, stroke: 'var(--color-bg-elev)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
