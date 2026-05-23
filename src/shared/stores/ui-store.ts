import { create } from 'zustand';

import { type HabitId, type LocalDate } from '@/shared/api/primitives';
import { getLocalDateISO } from '@/shared/lib/date';

export type ModalKind =
  | { type: 'none' }
  | { type: 'habit-create' }
  | { type: 'habit-edit'; habitId: HabitId }
  | { type: 'habit-delete-confirm'; habitId: HabitId }
  | { type: 'entry-note'; habitId: HabitId; date: LocalDate };

export type UiState = {
  selectedDate: LocalDate;
  modal: ModalKind;
  sidebarOpen: boolean;
  selectDate: (d: LocalDate) => void;
  openModal: (m: ModalKind) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  selectedDate: getLocalDateISO(),
  modal: { type: 'none' },
  sidebarOpen: false,
  selectDate: (d) => set({ selectedDate: d }),
  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: { type: 'none' } }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
