import { z } from 'zod';

import { api } from '@/shared/api/client';
import { type HabitId, type LocalDate } from '@/shared/api/primitives';

import {
  HabitEntrySchema,
  TodayItemSchema,
  type HabitEntry,
  type TodayItem,
  type UpsertEntryInput,
} from './schemas';

const TodayListSchema = z.array(TodayItemSchema);
const OkResponseSchema = z.object({ ok: z.literal(true) });

export async function getToday(date: LocalDate): Promise<TodayItem[]> {
  const json = await api.get('entries/today', { searchParams: { date } }).json();
  return TodayListSchema.parse(json);
}

export async function upsertEntry(habitId: HabitId, input: UpsertEntryInput): Promise<HabitEntry> {
  const json = await api.put(`habits/${habitId}/entries/${input.date}`, { json: input }).json();
  return HabitEntrySchema.parse(json);
}

export async function deleteEntry(habitId: HabitId, date: LocalDate): Promise<{ ok: true }> {
  const json = await api.delete(`habits/${habitId}/entries/${date}`).json();
  return OkResponseSchema.parse(json);
}
