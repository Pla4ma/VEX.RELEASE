import { create } from "zustand";

/**
 * Client-only UI state (Zustand — not server state).
 * TanStack Query owns server state. This store owns transient UI flags only:
 * homeHighlight — temporary banner state after session completion
 * completionSync — sync status for session completion ledger
 * comebackDismissed — one-shot dismissal flag
 */

export interface HomeHighlight {
  title: string;
  message: string;
  tone: "celebration" | "info" | "warning";
}

export interface CompletionSyncState {
  ledgerId: string | null;
  message: string | null;
  repairCtaLabel: string | null;
  status: "idle" | "pending_sync" | "synced" | "failed_sync";
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
    status: "idle",
    updatedAt: null,
  },
  homeHighlight: null,
  clearCompletionSyncState: () =>
    set({
      completionSync: {
        ledgerId: null,
        message: null,
        repairCtaLabel: null,
        status: "idle",
        updatedAt: null,
      },
    }),
  dismissComeback: () => set({ comebackDismissed: true }),
  resetComebackDismissal: () => set({ comebackDismissed: false }),
  setCompletionSyncState: (state) => set({ completionSync: state }),
  showHomeHighlight: (highlight) => set({ homeHighlight: highlight }),
  clearHomeHighlight: () => set({ homeHighlight: null }),
}));
