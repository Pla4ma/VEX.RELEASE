import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getMMKVStorageAdapter } from "../persistence/MMKVStorageAdapter";
import type { User } from "../types/models";
import type { Nullable } from "../types/global";
import { getSecureStorage, SecureStorageKeys } from "../persistence/SecureStorage";
import { signInWithEmail, signUpWithEmail, signOut, getCurrentUser } from "../services/supabaseAuth";
import { setSentryUser, clearSentryUser, captureException } from "../config/sentry";
import { revenueCatService } from "../shared/monetization/revenuecat-service";
import { progressionService } from "../services/progressionService";
import { economyService } from "../services/economyService";
import { rewardService } from "../services/rewardService";
import { streakService } from "../services/streakService";
import { createDebugger } from "../utils/debug";


export const useAppStore = create<AppState>()(
  immer((set) => ({
    isInitialized: false,
    isOnline: true,
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
  }))
);

export const useUIStore = create<UIState>()(
  immer((set) => ({
    toast: null,
    activeModal: null,
    modalProps: {},

    showToast: (toast) =>
      set((state) => {
        state.toast = {
          ...toast,
          id: `${Date.now()}-${Math.random()}`,
        };
      }),

    hideToast: () =>
      set((state) => {
        state.toast = null;
      }),

    showModal: (name, props = {}) =>
      set((state) => {
        state.activeModal = name;
        state.modalProps = props;
      }),

    hideModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalProps = {};
      }),
  }))
);

export function useStore() {
  return {
    auth: useAuthStore(),
    app: useAppStore(),
    ui: useUIStore(),
  };
}