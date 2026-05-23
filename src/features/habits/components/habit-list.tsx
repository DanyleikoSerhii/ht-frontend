import { ListChecksIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

import { useArchiveHabit, useDeleteHabit, useHabits } from '../hooks';
import { type Habit } from '../schemas';

import { HabitCard } from './habit-card';

const SKELETON_COUNT = 6;

type HabitListProps = {
  archived?: boolean;
  filterText?: string;
  onEdit?: (habit: Habit) => void;
};

export function HabitList({ archived, filterText, onEdit }: HabitListProps) {
  const query = useHabits({ archived });
  const archiveMutation = useArchiveHabit();
  const deleteMutation = useDeleteHabit();
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  const trimmedFilter = filterText?.trim().toLowerCase() ?? '';
  const sorted = useMemo(() => {
    if (!query.data) return [];
    const base = [...query.data].sort((a, b) => a.sortOrder - b.sortOrder);
    return trimmedFilter.length > 0
      ? base.filter((h) => h.title.toLowerCase().includes(trimmedFilter))
      : base;
  }, [query.data, trimmedFilter]);

  if (query.isPending) {
    return (
      <ListGrid>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </ListGrid>
    );
  }

  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'Failed to load habits';
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        <p>{message}</p>
        <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (sorted.length === 0) {
    const isFiltered = trimmedFilter.length > 0;
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <ListChecksIcon className="size-10 text-muted-foreground" aria-hidden />
        <div className="space-y-1">
          <h2 className="text-base font-semibold">
            {isFiltered ? 'No matching habits' : archived ? 'No archived habits' : 'No habits yet'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isFiltered
              ? `Nothing matches “${filterText}”. Try a different search.`
              : archived
                ? 'Habits you archive will appear here.'
                : 'Create your first habit to start tracking.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ListGrid>
        {sorted.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={onEdit}
            onArchive={(h) => archiveMutation.mutate(h.id)}
            onDelete={(h) => setPendingDelete(h)}
          />
        ))}
      </ListGrid>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `“${pendingDelete.title}” and all its history will be permanently removed. This action cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                if (!pendingDelete) return;
                e.preventDefault();
                deleteMutation.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ListGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function SkeletonCard() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
        </div>
        <div className="size-8 rounded-md bg-muted" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
    </div>
  );
}
