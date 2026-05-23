import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { type HabitId } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';

import { archive, create, get, list, remove, update, type ListHabitsParams } from './api';
import { type CreateHabitInput, type UpdateHabitInput } from './schemas';

export function useHabits(params?: ListHabitsParams) {
  return useQuery({
    queryKey: queryKeys.habits.list(params),
    queryFn: () => list(params),
  });
}

export function useHabit(id: HabitId) {
  return useQuery({
    queryKey: queryKeys.habits.detail(id),
    queryFn: () => get(id),
  });
}

function toastError(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  toast.error(message);
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitInput) => create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.all() });
      toast.success('Habit created');
    },
    onError: toastError,
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: HabitId; input: UpdateHabitInput }) => update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.all() });
      toast.success('Habit updated');
    },
    onError: toastError,
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: HabitId) => remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.all() });
      toast.success('Habit deleted');
    },
    onError: toastError,
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: HabitId) => archive(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.habits.all() });
      toast.success('Habit archived');
    },
    onError: toastError,
  });
}
