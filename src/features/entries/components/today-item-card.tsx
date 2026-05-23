import { Minus, Plus, MessageSquare, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type LocalDate } from '@/shared/api/primitives';
import { Button } from '@/shared/ui/button';
import { useUiStore } from '@/shared/stores/ui-store';
import { useToggleEntry } from '../hooks';
import { type TodayItem } from '../schemas';

type Props = {
  item: TodayItem;
  date: LocalDate;
};

export function TodayItemCard({ item, date }: Props) {
  const { habitId, title, color, icon, kind, targetPerDay, frequency, entry } = item;
  const openModal = useUiStore((s) => s.openModal);
  const { mutate: toggle, isPending } = useToggleEntry();

  const count = entry?.count ?? 0;
  const isBoolean = kind === 'boolean';
  const isDone = isBoolean ? count >= 1 : count >= targetPerDay;

  function handleBooleanToggle() {
    toggle({
      habitId,
      date,
      input: { count: isDone ? 0 : 1 },
    });
  }

  function handleDecrement() {
    if (count <= 0) return;
    toggle({ habitId, date, input: { count: count - 1 } });
  }

  function handleIncrement() {
    toggle({ habitId, date, input: { count: count + 1 } });
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-opacity',
        isPending && 'opacity-70',
      )}
    >
      {/* Icon circle */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: color + '33' }}
        aria-hidden
      >
        {icon ?? '✦'}
      </div>

      {/* Title + frequency */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="text-xs text-muted-foreground capitalize">{frequency}</p>
      </div>

      {/* Note button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => openModal({ type: 'entry-note', habitId, date })}
        aria-label={`Add note for ${title}`}
        className={cn(entry?.note && 'text-primary')}
      >
        <MessageSquare />
      </Button>

      {/* Toggle / counter */}
      {isBoolean ? (
        <button
          type="button"
          onClick={handleBooleanToggle}
          disabled={isPending}
          aria-label={isDone ? `Unmark ${title}` : `Mark ${title} as done`}
          aria-pressed={isDone}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            isDone
              ? 'border-accent bg-accent text-white'
              : 'border-border bg-background hover:border-accent/50',
          )}
        >
          {isDone && <Check className="size-5" />}
        </button>
      ) : (
        <div className="flex items-center gap-1" role="group" aria-label={`Counter for ${title}`}>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleDecrement}
            disabled={isPending || count <= 0}
            aria-label="Decrement"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {count}/{targetPerDay}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleIncrement}
            disabled={isPending}
            aria-label="Increment"
          >
            <Plus />
          </Button>
        </div>
      )}
    </div>
  );
}
