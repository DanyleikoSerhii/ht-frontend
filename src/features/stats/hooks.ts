import { useQuery } from '@tanstack/react-query';

import { type HabitId, type LocalDate } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';

import {
  getCompletionTrend,
  getDashboardSummary,
  getHabitStats,
  getHeatmap,
  getWeekdayBreakdown,
} from './api';
import { type StatsPeriod } from './schemas';

export function useHabitStats(id: HabitId) {
  return useQuery({
    queryKey: queryKeys.habits.stats(id),
    queryFn: () => getHabitStats(id),
  });
}

export function useHeatmap(id: HabitId, from: LocalDate, to: LocalDate) {
  return useQuery({
    queryKey: queryKeys.habits.heatmap(id, from, to),
    queryFn: () => getHeatmap(id, from, to),
  });
}

export function useDashboardSummary(period: StatsPeriod) {
  return useQuery({
    queryKey: queryKeys.stats.summary(period),
    queryFn: () => getDashboardSummary(period),
  });
}

export function useCompletionTrend(period: StatsPeriod) {
  return useQuery({
    queryKey: queryKeys.stats.completionTrend(period),
    queryFn: () => getCompletionTrend(period),
  });
}

export function useWeekdayBreakdown(period: StatsPeriod) {
  return useQuery({
    queryKey: queryKeys.stats.weekdayBreakdown(period),
    queryFn: () => getWeekdayBreakdown(period),
  });
}
