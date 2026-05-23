import { createFileRoute, notFound } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { useEntriesRange } from '@/features/entries/hooks';
import { Heatmap } from '@/features/heatmap/components/heatmap';
import { get } from '@/features/habits/api';
import { useHabit } from '@/features/habits/hooks';
import { useHabitStats, useHeatmap } from '@/features/stats/hooks';
import { StreakStat } from '@/features/streaks/components/streak-stat';
import { ApiError } from '@/shared/api/errors';
import { HabitId } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';
import { addDays, getLocalDateISO } from '@/shared/lib/date';

export const Route = createFileRoute('/_authenticated/habits/$id')({
  loader: async ({ params, context }) => {
    let id: HabitId;
    try {
      id = HabitId.parse(params.id);
    } catch {
      throw notFound();
    }
    try {
      await context.queryClient.ensureQueryData({
        queryKey: queryKeys.habits.detail(id),
        queryFn: () => get(id),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        throw notFound();
      }
      throw err;
    }
  },
  component: HabitDetailPage,
});

function HabitDetailPage() {
  const { id: rawId } = Route.useParams();
  const id = HabitId.parse(rawId);

  const { today, yearAgo } = useMemo(() => {
    const today = getLocalDateISO();
    return { today, yearAgo: addDays(today, -364) };
  }, []);

  const habit = useHabit(id);
  const stats = useHabitStats(id);
  const heatmap = useHeatmap(id, yearAgo, today);
  const entries = useEntriesRange(id, yearAgo, today);

  const recentEntries = useMemo(
    () =>
      [...(entries.data ?? [])]
        .filter((e) => e.count > 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20),
    [entries.data],
  );

  if (habit.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!habit.data) return null;

  const { title, color, description } = habit.data;

  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="flex items-start gap-3">
        <div
          className="mt-1 size-5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </header>

      {/* Streak stats */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Streaks
        </h2>
        <StreakStat stats={stats.data} isLoading={stats.isLoading} />
      </div>

      {/* Heatmap */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Activity
        </h2>
        {heatmap.isLoading ? (
          <div className="h-[88px] animate-pulse rounded-xl bg-muted" />
        ) : heatmap.data ? (
          <Heatmap cells={heatmap.data.cells} habitColor={color} from={yearAgo} to={today} />
        ) : null}
      </div>

      {/* Recent entries */}
      {(recentEntries.length > 0 || entries.isLoading) && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Recent entries
          </h2>
          {entries.isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {recentEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {dayjs(entry.date).format('D MMM YYYY')}
                    </span>
                    {entry.note && (
                      <span className="text-sm text-muted-foreground">{entry.note}</span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {entry.count}×
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
