import { z } from 'zod';

import { api } from '@/shared/api/client';
import { type HabitId, type LocalDate } from '@/shared/api/primitives';
import type { Entry as BackendEntry, TodayItem as BackendTodayItem } from '@/shared/api/types';

import {
  HabitEntrySchema,
  TodayResponseSchema,
  type HabitEntry,
  type TodayItem,
  type UpsertEntryInput,
} from './schemas';

const OkResponseSchema = z.object({ ok: z.literal(true) });

export async function getToday(date: LocalDate): Promise<TodayItem[]> {
  const json = await api.get('today', { searchParams: { date } }).json();
  const resp = TodayResponseSchema.parse(json);
  void (resp.items satisfies BackendTodayItem[]);
  return resp.items;
}

export async function upsertEntry(
  habitId: HabitId,
  date: LocalDate,
  input: UpsertEntryInput,
): Promise<HabitEntry> {
  const json = await api.put(`habits/${habitId}/entries/${date}`, { json: input }).json();
  const result = z.object({ entry: HabitEntrySchema }).parse(json).entry;
  void (result satisfies BackendEntry);
  return result;
}

export async function deleteEntry(habitId: HabitId, date: LocalDate): Promise<{ ok: true }> {
  const json = await api.delete(`habits/${habitId}/entries/${date}`).json();
  return OkResponseSchema.parse(json);
}

export async function getEntriesRange(
  habitId: HabitId,
  from: LocalDate,
  to: LocalDate,
): Promise<HabitEntry[]> {
  const json = await api.get(`habits/${habitId}/entries`, { searchParams: { from, to } }).json();
  const result = z.object({ entries: z.array(HabitEntrySchema) }).parse(json).entries;
  void (result satisfies BackendEntry[]);
  return result;
}
