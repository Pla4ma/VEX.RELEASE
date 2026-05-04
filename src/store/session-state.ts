import { create } from 'zustand';

export interface HomeHighlight {
  title: string;
  message: string;
  tone: 'celebration' | 'info' | 'warning';
}

interface SessionUIState {
  comebackDismissed: boolean;
  homeHighlight: HomeHighlight | null;
  dismissComeback: () => void;
  resetComebackDismissal: () => void;
  showHomeHighlight: (highlight: HomeHighlight) => void;
  clearHomeHighlight: () => void;
}

export const useSessionUIStore = create<SessionUIState>((set) => ({
  comebackDismissed: false,
  homeHighlight: null,
  dismissComeback: () => set({ comebackDismissed: true }),
  resetComebackDismissal: () => set({ comebackDismissed: false }),
  showHomeHighlight: (highlight) => set({ homeHighlight: highlight }),
  clearHomeHighlight: () => set({ homeHighlight: null }),
}));
