import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { addDays, formatHumanDate, getLocalDateISO } from '@/shared/lib/date';
import { useUiStore } from '@/shared/stores/ui-store';

export function DateSwitcher() {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const selectDate = useUiStore((s) => s.selectDate);
  const today = getLocalDateISO();

  const isToday = selectedDate === today;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => selectDate(addDays(selectedDate, -1))}
        aria-label="Previous day"
      >
        <ChevronLeft />
      </Button>

      <button
        type="button"
        onClick={() => selectDate(today)}
        className="calm min-w-[136px] rounded-full px-3 py-1.5 text-sm font-medium tracking-tight text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
        aria-label={isToday ? 'Today (current)' : `Go to today from ${selectedDate}`}
      >
        {isToday
          ? `Today · ${formatHumanDate(selectedDate, 'en')}`
          : formatHumanDate(selectedDate, 'en')}
      </button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => selectDate(addDays(selectedDate, 1))}
        aria-label="Next day"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
