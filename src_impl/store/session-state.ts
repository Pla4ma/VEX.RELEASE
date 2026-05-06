import { create } from 'zustand';

export interface HomeHighlight {
  title: string;
  message: string;
  tone: 'celebration' | 'info' | 'warning';
}

export interface CompletionSyncState {
  ledgerId: string | null;
  message: string | null;
  repairCtaLabel: string | null;
  status: 'idle' | 'pending_sync' | 'synced' | 'failed_sync';
  updatedAt: number | null;
}

interface SessionUIState {
  comebackDismissed: boolean;
  completionSync: CompletionSyncState;
  homeHighlight: HomeHighlight | null;
  clearCompletionSyncState: () => void;
  dismissComeback: () => void;
  resetComebackDismissal: () => void;
  setCompletionSyncState: (state: CompletionSyncState) => void;
  showHomeHighlight: (highlight: HomeHighlight) => void;
  clearHomeHighlight: () => void;
}

export const useSessionUIStore = create<SessionUIState>((set) => ({
  comebackDismissed: false,
  completionSync: {
    ledgerId: null,
    message: null,
    repairCtaLabel: null,
    status: 'idle',
    updatedAt: null,
  },
  homeHighlight: null,
  clearCompletionSyncState: () =>
    set({
      completionSync: {
        ledgerId: null,
        message: null,
        repairCtaLabel: null,
        status: 'idle',
        updatedAt: null,
      },
    }),
  dismissComeback: () => set({ comebackDismissed: true }),
  resetComebackDismissal: () => set({ comebackDismissed: false }),
  setCompletionSyncState: (state) => set({ completionSync: state }),
  showHomeHighlight: (highlight) => set({ homeHighlight: highlight }),
  clearHomeHighlight: () => set({ homeHighlight: null }),
}));
