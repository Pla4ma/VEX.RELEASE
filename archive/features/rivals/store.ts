/**
 * Rivals Store
 *
 * Zustand store for rival state management.
 * @phase 4A
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { CurrentRival, RivalHistoryEntry } from './schemas';

interface RivalsState {
  currentRival: CurrentRival | null;
  history: RivalHistoryEntry[];
  isLoading: boolean;
  error: Error | null;
}

interface RivalsActions {
  setCurrentRival: (rival: CurrentRival | null) => void;
  updateWeeklyScore: (mine: number, theirs: number) => void;
  addHistoryEntry: (entry: RivalHistoryEntry) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearRival: () => void;
}

export type RivalsStore = RivalsState & RivalsActions;

const initialState: RivalsState = {
  currentRival: null,
  history: [],
  isLoading: false,
  error: null,
};

// Use proper MMKV storage adapter for persistence
const mmkvStorage = getMMKVStorageAdapter();

export const useRivalsStore = create<RivalsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentRival: (rival) => set({ currentRival: rival }),

      updateWeeklyScore: (mine, theirs) =>
        set((state) => ({
          currentRival: state.currentRival
            ? {
                ...state.currentRival,
                weeklyScore: {
                  mine,
                  theirs,
                  lastUpdated: Date.now(),
                },
              }
            : null,
        })),

      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [entry, ...state.history.slice(0, 9)], // Keep last 10
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearRival: () => set({ currentRival: null }),
    }),
    {
      name: 'vex-rivals-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> => {
          return await mmkvStorage.getItem(name);
        },
        setItem: async (name: string, value: string): Promise<void> => {
          await mmkvStorage.setItem(name, value);
        },
        removeItem: async (name: string): Promise<void> => {
          await mmkvStorage.removeItem(name);
        },
      })),
    }
  )
);

/**
 * Hook to get current rivalry status
 */
export function useRivalStatus() {
  const { currentRival } = useRivalsStore();

  if (!currentRival) {
    return {
      hasRival: false,
      isAhead: false,
      isBehind: false,
      isTied: false,
      margin: 0,
    };
  }

  const margin = currentRival.weeklyScore.mine - currentRival.weeklyScore.theirs;

  return {
    hasRival: true,
    isAhead: margin > 0,
    isBehind: margin < 0,
    isTied: margin === 0,
    margin: Math.abs(margin),
    rivalName: currentRival.profile.name,
    myScore: currentRival.weeklyScore.mine,
    theirScore: currentRival.weeklyScore.theirs,
    daysRemaining: currentRival.daysRemaining,
  };
}
