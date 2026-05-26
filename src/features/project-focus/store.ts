import { create } from 'zustand';

interface ProjectFocusUIState {
  activeThreadId: string | null;
  rescuedThreadId: string | null;
  setActiveThread: (threadId: string | null) => void;
  markRescued: (threadId: string | null) => void;
  clearRescueFlag: () => void;
}

export const useProjectFocusStore = create<ProjectFocusUIState>((set) => ({
  activeThreadId: null,
  rescuedThreadId: null,
  setActiveThread: (threadId) => set({ activeThreadId: threadId }),
  markRescued: (threadId) => set({ rescuedThreadId: threadId }),
  clearRescueFlag: () => set({ rescuedThreadId: null }),
}));
