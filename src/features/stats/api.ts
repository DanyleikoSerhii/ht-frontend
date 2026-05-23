import { api } from '@/shared/api/client';
import { type HabitId, type LocalDate } from '@/shared/api/primitives';
import type {
  CompletionTrend as BackendCompletionTrend,
  DashboardSummary as BackendDashboardSummary,
  HabitStats as BackendHabitStats,
  HeatmapResponse as BackendHeatmapResponse,
  WeekdayBreakdown as BackendWeekdayBreakdown,
} from '@/shared/api/types';

import {
  CompletionTrendSchema,
  DashboardSummarySchema,
  HabitStatsSchema,
  HeatmapResponseSchema,
  WeekdayBreakdownSchema,
  type CompletionTrend,
  type DashboardSummary,
  type HabitStats,
  type HeatmapResponse,
  type StatsPeriod,
  type WeekdayBreakdown,
} from './schemas';

export async function getHabitStats(id: HabitId): Promise<HabitStats> {
  const json = await api.get(`habits/${id}/stats`).json();
  const result = HabitStatsSchema.parse(json);
  void (result satisfies BackendHabitStats);
  return result;
}

export async function getHeatmap(
  id: HabitId,
  from: LocalDate,
  to: LocalDate,
): Promise<HeatmapResponse> {
  const json = await api.get(`habits/${id}/heatmap`, { searchParams: { from, to } }).json();
  const result = HeatmapResponseSchema.parse(json);
  void (result satisfies BackendHeatmapResponse);
  return result;
}

export async function getDashboardSummary(period: StatsPeriod): Promise<DashboardSummary> {
  const json = await api.get('stats/summary', { searchParams: { period } }).json();
  const result = DashboardSummarySchema.parse(json);
  void (result satisfies BackendDashboardSummary);
  return result;
}

export async function getCompletionTrend(period: StatsPeriod): Promise<CompletionTrend> {
  const json = await api.get('stats/completion-trend', { searchParams: { period } }).json();
  const result = CompletionTrendSchema.parse(json);
  void (result satisfies BackendCompletionTrend);
  return result;
}

export async function getWeekdayBreakdown(period: StatsPeriod): Promise<WeekdayBreakdown> {
  const json = await api.get('stats/weekday-breakdown', { searchParams: { period } }).json();
  const result = WeekdayBreakdownSchema.parse(json);
  void (result satisfies BackendWeekdayBreakdown);
  return result;
}
