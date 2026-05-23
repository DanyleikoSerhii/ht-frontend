import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { EntryId, IsoDateTime, type HabitId, type LocalDate } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';

import { deleteEntry, getToday, upsertEntry } from './api';
import { type TodayItem, type UpsertEntryInput } from './schemas';

export function useTodayItems(date: LocalDate) {
  return useQuery({
    queryKey: queryKeys.entries.today(date),
    queryFn: () => getToday(date),
  });
}

type ToggleEntryVars = {
  habitId: HabitId;
  input: UpsertEntryInput;
};

export function useToggleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, input }: ToggleEntryVars) => upsertEntry(habitId, input),

    onMutate: async ({ habitId, input }) => {
      const queryKey = queryKeys.entries.today(input.date);
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData<TodayItem[]>(queryKey);

      queryClient.setQueryData<TodayItem[]>(queryKey, (prev) =>
        prev?.map((item) => {
          if (item.habit.id !== habitId) return item;
          const now = IsoDateTime.parse(new Date().toISOString());
          const entry = item.entry
            ? { ...item.entry, count: input.count, note: input.note ?? item.entry.note }
            : {
                id: EntryId.parse(crypto.randomUUID()),
                habitId,
                date: input.date,
                count: input.count,
                note: input.note ?? null,
                createdAt: now,
                updatedAt: now,
              };
          return { ...item, entry };
        }),
      );

      return { snapshot, queryKey };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(ctx.queryKey, ctx.snapshot);
      toast.error('Failed to update entry');
    },

    onSettled: (_data, _err, { habitId, input }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.entries.today(input.date) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.detail(habitId) });
    },
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
