import { z } from 'zod';

import { api } from '@/shared/api/client';
import { type HabitId } from '@/shared/api/primitives';
import type {
  CreateHabitInput as BackendCreateHabitInput,
  Habit as BackendHabit,
  UpdateHabitInput as BackendUpdateHabitInput,
} from '@/shared/api/types';

import { HabitSchema, type CreateHabitInput, type Habit, type UpdateHabitInput } from './schemas';

const HabitsResponseSchema = z.object({ habits: z.array(HabitSchema) });
const HabitResponseSchema = z.object({ habit: HabitSchema });
const OkResponseSchema = z.object({ ok: z.literal(true) });

export type ListHabitsParams = {
  archived?: boolean;
};

export async function list(params?: ListHabitsParams): Promise<Habit[]> {
  const searchParams = params?.archived !== undefined ? { archived: params.archived } : undefined;
  const json = await api.get('habits', { searchParams }).json();
  const result = HabitsResponseSchema.parse(json).habits;
  void (result satisfies BackendHabit[]);
  return result;
}

export async function get(id: HabitId): Promise<Habit> {
  const json = await api.get(`habits/${id}`).json();
  const result = HabitResponseSchema.parse(json).habit;
  void (result satisfies BackendHabit);
  return result;
}

export async function create(input: CreateHabitInput): Promise<Habit> {
  void (input satisfies BackendCreateHabitInput);
  const json = await api.post('habits', { json: input }).json();
  const result = HabitResponseSchema.parse(json).habit;
  void (result satisfies BackendHabit);
  return result;
}

export async function update(id: HabitId, input: UpdateHabitInput): Promise<Habit> {
  void (input satisfies BackendUpdateHabitInput);
  const json = await api.patch(`habits/${id}`, { json: input }).json();
  const result = HabitResponseSchema.parse(json).habit;
  void (result satisfies BackendHabit);
  return result;
}

// `delete` is a JS reserved word; consumers can `import { remove as deleteHabit }`.
export async function remove(id: HabitId): Promise<{ ok: true }> {
  const json = await api.delete(`habits/${id}`).json();
  return OkResponseSchema.parse(json);
}

export async function archive(id: HabitId): Promise<Habit> {
  const json = await api.post(`habits/${id}/archive`).json();
  const result = HabitResponseSchema.parse(json).habit;
  void (result satisfies BackendHabit);
  return result;
}
