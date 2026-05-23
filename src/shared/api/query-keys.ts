import { type HabitId, type LocalDate } from './primitives';

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  habits: {
    all: () => ['habits'] as const,
    list: (params?: { archived?: boolean }) => ['habits', 'list', params ?? {}] as const,
    detail: (id: HabitId) => ['habits', 'detail', id] as const,
  },
  entries: {
    all: () => ['entries'] as const,
    today: (date: LocalDate) => ['entries', 'today', date] as const,
    range: (habitId: HabitId, from: LocalDate, to: LocalDate) =>
      ['entries', 'range', habitId, from, to] as const,
  },
} as const;
