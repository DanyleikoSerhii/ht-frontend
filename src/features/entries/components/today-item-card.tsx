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
  const { habit, entry } = item;
  const openModal = useUiStore((s) => s.openModal);
  const { mutate: toggle, isPending } = useToggleEntry();

  const count = entry?.count ?? 0;
  const isBoolean = habit.kind === 'boolean';
  const isDone = isBoolean ? count >= 1 : count >= habit.targetPerDay;

  function handleBooleanToggle() {
    toggle({
      habitId: habit.id,
      input: { date, count: isDone ? 0 : 1 },
    });
  }

  function handleDecrement() {
    if (count <= 0) return;
    toggle({ habitId: habit.id, input: { date, count: count - 1 } });
  }

  function handleIncrement() {
    toggle({ habitId: habit.id, input: { date, count: count + 1 } });
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
        style={{ backgroundColor: habit.color + '33' }}
        aria-hidden
      >
        {habit.icon ?? '✦'}
      </div>

      {/* Title + frequency */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{habit.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{habit.frequency}</p>
      </div>

      {/* Note button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => openModal({ type: 'entry-note', habitId: habit.id, date })}
        aria-label={`Add note for ${habit.title}`}
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
          aria-label={isDone ? `Unmark ${habit.title}` : `Mark ${habit.title} as done`}
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
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label={`Counter for ${habit.title}`}
        >
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
            {count}/{habit.targetPerDay}
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
