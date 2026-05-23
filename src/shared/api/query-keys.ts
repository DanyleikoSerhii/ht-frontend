import { type HabitId, type LocalDate } from './primitives';
import { type StatsPeriod } from '@/features/stats/schemas';

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  habits: {
    all: () => ['habits'] as const,
    list: (params?: { archived?: boolean }) => ['habits', 'list', params ?? {}] as const,
    detail: (id: HabitId) => ['habits', 'detail', id] as const,
    stats: (id: HabitId) => ['habits', id, 'stats'] as const,
    heatmap: (id: HabitId, from: LocalDate, to: LocalDate) =>
      ['habits', id, 'heatmap', from, to] as const,
    entries: (id: HabitId, from: LocalDate, to: LocalDate) =>
      ['habits', id, 'entries', from, to] as const,
  },
  entries: {
    all: () => ['entries'] as const,
    today: (date: LocalDate) => ['entries', 'today', date] as const,
    range: (habitId: HabitId, from: LocalDate, to: LocalDate) =>
      ['entries', 'range', habitId, from, to] as const,
  },
  stats: {
    summary: (period: StatsPeriod) => ['stats', 'summary', period] as const,
    completionTrend: (period: StatsPeriod) => ['stats', 'completion-trend', period] as const,
    weekdayBreakdown: (period: StatsPeriod) => ['stats', 'weekday', period] as const,
  },
} as const;
