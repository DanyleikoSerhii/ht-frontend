import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts';

import { type WeekdayBreakdown } from '@/features/stats/schemas';

import { ChartContainer, type ChartTooltipProps } from './chart-container';

const AMBER = '#f59e0b';
const PINK = '#fb7185';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ISO display order: Mon first
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

function lerp(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(g1 + (g2 - g1) * t)
    .toString(16)
    .padStart(2, '0');
  const b = Math.round(b1 + (b2 - b1) * t)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${b}`;
}

function WeekdayTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const rate = typeof payload[0].value === 'number' ? payload[0].value : 0;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{Math.round(rate * 100)}% completed</p>
    </div>
  );
}

type Props = {
  breakdown: WeekdayBreakdown | undefined;
  isLoading: boolean;
};

export function WeekdayBreakdownChart({ breakdown, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-60 animate-pulse rounded-xl bg-muted" />;
  }

  if (!breakdown) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No data for this period
      </div>
    );
  }

  const byWeekday = new Map(breakdown.data.map((item) => [item.weekday, item]));

  const data = DISPLAY_ORDER.map((wd, i) => {
    const item = byWeekday.get(wd);
    return {
      name: DAY_NAMES[wd],
      rate: item?.rate ?? 0,
      color: lerp(AMBER, PINK, i / 6),
    };
  });

  return (
    <ChartContainer height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
          tickLine={false}
          axisLine={false}
          domain={[0, 1]}
          width={36}
        />
        <Tooltip content={WeekdayTooltip} cursor={{ fill: 'var(--color-border)', opacity: 0.5 }} />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
