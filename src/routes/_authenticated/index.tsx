import { createFileRoute } from '@tanstack/react-router';

import { DateSwitcher } from '@/features/entries/components/date-switcher';
import { TodayList } from '@/features/entries/components/today-list';
import { useUiStore } from '@/shared/stores/ui-store';

export const Route = createFileRoute('/_authenticated/')({
  component: TodayPage,
});

function TodayPage() {
  const selectedDate = useUiStore((s) => s.selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <DateSwitcher />
      </div>
      <TodayList date={selectedDate} />
    </div>
  );
}
