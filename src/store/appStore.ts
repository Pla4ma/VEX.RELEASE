import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Nullable } from '../types/global';

export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  lastSyncTime: Nullable<number>;
  setInitialized: (initialized: boolean) => void;
  setOnline: (online: boolean) => void;
  setLastSyncTime: (time: number) => void;
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    isInitialized: false,
    isOnline: false,
    lastSyncTime: null,
    setInitialized: (initialized) =>
      set((state) => {
        state.isInitialized = initialized;
      }),
    setOnline: (online) =>
      set((state) => {
        state.isOnline = online;
      }),
    setLastSyncTime: (time) =>
      set((state) => {
        state.lastSyncTime = time;
      }),
  })),
);
