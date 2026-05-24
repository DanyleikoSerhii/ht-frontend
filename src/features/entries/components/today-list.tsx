import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { type LocalDate } from '@/shared/api/primitives';
import { useTodayItems } from '../hooks';
import { TodayItemCard } from './today-item-card';

type Props = {
  date: LocalDate;
};

export function TodayList({ date }: Props) {
  const { data, isLoading, isError } = useTodayItems(date);
  const [notDueOpen, setNotDueOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        role="alert"
      >
        Failed to load habits. Please try again.
      </p>
    );
  }

  const due = data?.filter((i) => i.isDue) ?? [];
  const notDue = data?.filter((i) => !i.isDue) ?? [];

  if (due.length === 0 && notDue.length === 0) {
    return (
      <div className="app-tile flex flex-col items-center gap-3 py-16 text-center">
        <span
          className="flex size-14 items-center justify-center rounded-2xl bg-[var(--color-mint-soft)] text-2xl text-[var(--color-mint)]"
          aria-hidden
        >
          ✦
        </span>
        <p className="font-display text-base tracking-tight">No habits yet</p>
        <p className="-mt-1.5 text-sm text-muted-foreground">Plant your first one to start.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Due habits */}
      {due.length > 0 && (
        <section aria-label="Today's habits">
          <div className="space-y-3">
            {due.map((item) => (
              <TodayItemCard key={item.habitId} item={item} date={date} />
            ))}
          </div>
        </section>
      )}

      {/* Not due today — collapsible */}
      {notDue.length > 0 && (
        <section aria-label="Not scheduled for today">
          <button
            type="button"
            onClick={() => setNotDueOpen((v) => !v)}
            className="calm flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            aria-expanded={notDueOpen}
          >
            <span>Not scheduled today ({notDue.length})</span>
            {notDueOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {notDueOpen && (
            <div className="mt-2 space-y-3 opacity-60">
              {notDue.map((item) => (
                <TodayItemCard key={item.habitId} item={item} date={date} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
