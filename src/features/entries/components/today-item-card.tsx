import * as Icons from 'lucide-react';
import { Check, type LucideIcon, MessageSquare, Minus, Plus } from 'lucide-react';
import { createElement } from 'react';

import { cn } from '@/lib/utils';
import { type LocalDate } from '@/shared/api/primitives';
import { useUiStore } from '@/shared/stores/ui-store';
import { Button } from '@/shared/ui/button';

import { useToggleEntry } from '../hooks';
import { type TodayItem } from '../schemas';

type Props = {
  item: TodayItem;
  date: LocalDate;
};

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return Icons.CircleDashedIcon;
  const map = Icons as unknown as Record<string, LucideIcon | undefined>;
  return map[name] ?? Icons.CircleDashedIcon;
}

export function TodayItemCard({ item, date }: Props) {
  const { habitId, title, color, icon, kind, targetPerDay, frequency, entry } = item;
  const openModal = useUiStore((s) => s.openModal);
  const { mutate: toggle, isPending } = useToggleEntry();

  const count = entry?.count ?? 0;
  const isBoolean = kind === 'boolean';
  const isDone = isBoolean ? count >= 1 : count >= targetPerDay;
  const IconComponent = resolveIcon(icon);

  function handleBooleanToggle() {
    toggle({ habitId, date, input: { count: isDone ? 0 : 1 } });
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
        'app-tile calm flex items-center gap-3 p-3.5 sm:p-4',
        isPending && 'opacity-70',
      )}
    >
      {/* Icon squircle */}
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}24`, color }}
        aria-hidden
      >
        {createElement(IconComponent, { className: 'size-5' })}
      </div>

      {/* Title + frequency */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold tracking-tight">{title}</p>
        <p className="text-xs capitalize text-muted-foreground">{frequency}</p>
      </div>

      {/* Note button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => openModal({ type: 'entry-note', habitId, date })}
        aria-label={`Add note for ${title}`}
        className={cn(entry?.note && 'text-[var(--color-peach)]')}
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
            'calm flex size-10 shrink-0 items-center justify-center rounded-full',
            isDone
              ? 'bg-[var(--color-mint)] text-[#0f3623] shadow-[0_4px_10px_-4px_color-mix(in_oklab,var(--color-mint)_50%,transparent)]'
              : 'border-2 border-dashed border-foreground/20 bg-transparent hover:border-[var(--color-mint)]/70',
          )}
        >
          {isDone && <Check className="size-5 animate-[fade-in_0.3s_ease]" strokeWidth={2.5} />}
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
          <span
            className="min-w-10 rounded-lg bg-muted px-2 py-1 text-center text-[0.8rem] font-semibold tabular-nums"
            aria-live="polite"
          >
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
