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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => selectDate(addDays(selectedDate, -1))}
        aria-label="Previous day"
      >
        <ChevronLeft />
      </Button>

      <button
        type="button"
        onClick={() => selectDate(today)}
        className="min-w-[120px] rounded-full bg-muted px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={isToday ? 'Today (current)' : `Go to today from ${selectedDate}`}
      >
        {formatHumanDate(selectedDate, 'en')}
      </button>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => selectDate(addDays(selectedDate, 1))}
        aria-label="Next day"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
