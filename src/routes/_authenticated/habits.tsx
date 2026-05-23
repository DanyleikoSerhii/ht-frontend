import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useMemo } from 'react';
import { z } from 'zod';

import { HabitForm } from '@/features/habits/components/habit-form';
import { HabitList } from '@/features/habits/components/habit-list';
import { useCreateHabit, useUpdateHabit } from '@/features/habits/hooks';
import { type CreateHabitInput, type Habit } from '@/features/habits/schemas';
import { cn } from '@/lib/utils';
import { type HabitId } from '@/shared/api/primitives';
import { queryKeys } from '@/shared/api/query-keys';
import { useUiStore } from '@/shared/stores/ui-store';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';

const SearchSchema = z.object({
  q: z.string().default(''),
  archived: z.boolean().default(false),
});

export const Route = createFileRoute('/_authenticated/habits')({
  validateSearch: SearchSchema,
  component: HabitsPage,
});

// Habit has server-only fields HabitForm's FormValues doesn't accept (id,
// createdAt, archivedAt, sortOrder). Drop them so TS + RHF stay happy.
function toFormDefaults(habit: Habit) {
  const {
    id: _id,
    createdAt: _createdAt,
    archivedAt: _archivedAt,
    sortOrder: _sortOrder,
    ...rest
  } = habit;
  return rest;
}

function HabitsPage() {
  const { q, archived } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const openModal = useUiStore((s) => s.openModal);

  function setSearch(next: Partial<{ q: string; archived: boolean }>) {
    void navigate({
      search: (prev) => ({ ...prev, ...next }),
      replace: true,
    });
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        <Button onClick={() => openModal({ type: 'habit-create' })}>
          <PlusIcon />
          Habit
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search habits…"
            aria-label="Search habits"
            value={q}
            onChange={(e) => setSearch({ q: e.target.value })}
            className="pl-9"
          />
        </div>
        <div
          role="tablist"
          aria-label="Habit status filter"
          className="inline-flex rounded-md border border-input p-0.5"
        >
          <FilterTab
            active={!archived}
            onClick={() => setSearch({ archived: false })}
            label="Active"
          />
          <FilterTab
            active={archived}
            onClick={() => setSearch({ archived: true })}
            label="Archived"
          />
        </div>
      </div>

      <HabitList
        archived={archived}
        filterText={q}
        onEdit={(habit) => openModal({ type: 'habit-edit', habitId: habit.id })}
      />

      <HabitFormDialog />
    </section>
  );
}

type FilterTabProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

function FilterTab({ active, onClick, label }: FilterTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded px-3 py-1 text-sm font-medium transition-colors',
        active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}

function HabitFormDialog() {
  const modal = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);
  const create = useCreateHabit();
  const update = useUpdateHabit();
  const qc = useQueryClient();

  const isOpen = modal.type === 'habit-create' || modal.type === 'habit-edit';
  const isEdit = modal.type === 'habit-edit';
  const editId = modal.type === 'habit-edit' ? modal.habitId : null;

  const editHabit = useMemo(() => (editId ? findHabitInListCache(qc, editId) : null), [editId, qc]);

  async function handleSubmit(values: CreateHabitInput) {
    if (modal.type === 'habit-create') {
      await create.mutateAsync(values);
    } else if (modal.type === 'habit-edit') {
      await update.mutateAsync({ id: modal.habitId, input: values });
    }
    closeModal();
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit habit' : 'New habit'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the details of this habit. Changes save when you submit.'
              : 'Add a new habit to track. You can edit it later from this page.'}
          </DialogDescription>
        </DialogHeader>
        {isOpen ? (
          <HabitForm
            key={isEdit ? editId : 'create'}
            defaultValues={editHabit ? toFormDefaults(editHabit) : undefined}
            submitLabel={isEdit ? 'Save' : 'Create'}
            onSubmit={handleSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// Walk every cached habits.list(...) query and return the first habit with a
// matching id. The /habits route always populates one such list before the
// edit modal can open (the click comes from a rendered HabitCard).
function findHabitInListCache(qc: QueryClient, id: HabitId): Habit | null {
  const lists = qc.getQueriesData<Habit[]>({ queryKey: queryKeys.habits.all() });
  for (const [, data] of lists) {
    if (!data) continue;
    const found = data.find((h) => h.id === id);
    if (found) return found;
  }
  return null;
}
