import { z } from 'zod';

import { api } from '@/shared/api/client';
import { type HabitId } from '@/shared/api/primitives';

import { HabitSchema, type CreateHabitInput, type Habit, type UpdateHabitInput } from './schemas';

const HabitListSchema = z.array(HabitSchema);
const OkResponseSchema = z.object({ ok: z.literal(true) });

export type ListHabitsParams = {
  archived?: boolean;
};

export async function list(params?: ListHabitsParams): Promise<Habit[]> {
  const searchParams = params?.archived !== undefined ? { archived: params.archived } : undefined;
  const json = await api.get('habits', { searchParams }).json();
  return HabitListSchema.parse(json);
}

export async function get(id: HabitId): Promise<Habit> {
  const json = await api.get(`habits/${id}`).json();
  return HabitSchema.parse(json);
}

export async function create(input: CreateHabitInput): Promise<Habit> {
  const json = await api.post('habits', { json: input }).json();
  return HabitSchema.parse(json);
}

export async function update(id: HabitId, input: UpdateHabitInput): Promise<Habit> {
  const json = await api.patch(`habits/${id}`, { json: input }).json();
  return HabitSchema.parse(json);
}

// `delete` is a JS reserved word; consumers can `import { remove as deleteHabit }`.
export async function remove(id: HabitId): Promise<{ ok: true }> {
  const json = await api.delete(`habits/${id}`).json();
  return OkResponseSchema.parse(json);
}

export async function archive(id: HabitId): Promise<Habit> {
  const json = await api.post(`habits/${id}/archive`).json();
  return HabitSchema.parse(json);
}
