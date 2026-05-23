import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { type HabitId, type LocalDate } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';

import { deleteEntry, getEntriesRange, getToday, upsertEntry } from './api';
import { type TodayItem, type UpsertEntryInput } from './schemas';

export function useTodayItems(date: LocalDate) {
  return useQuery({
    queryKey: queryKeys.entries.today(date),
    queryFn: () => getToday(date),
  });
}

type ToggleEntryVars = {
  habitId: HabitId;
  date: LocalDate;
  input: UpsertEntryInput;
};

export function useToggleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, date, input }: ToggleEntryVars) => upsertEntry(habitId, date, input),

    onMutate: async ({ habitId, date, input }) => {
      const queryKey = queryKeys.entries.today(date);
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<TodayItem[]>(queryKey);

      queryClient.setQueryData<TodayItem[]>(queryKey, (prev) =>
        prev?.map((item) => {
          if (item.habitId !== habitId) return item;
          const entry = item.entry
            ? { ...item.entry, count: input.count, note: input.note ?? item.entry.note }
            : { count: input.count, note: input.note ?? null };
          return { ...item, entry };
        }),
      );

      return { snapshot, queryKey };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.queryKey, ctx.snapshot);
      toast.error('Failed to update entry');
    },

    onSettled: (_data, _err, { habitId, date }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.entries.today(date) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.detail(habitId) });
    },
  });
}

export function useEntriesRange(habitId: HabitId, from: LocalDate, to: LocalDate) {
  return useQuery({
    queryKey: queryKeys.entries.range(habitId, from, to),
    queryFn: () => getEntriesRange(habitId, from, to),
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: HabitId; date: LocalDate }) =>
      deleteEntry(habitId, date),
    onSuccess: (_data, { date }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.entries.today(date) });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    },
  });
}
