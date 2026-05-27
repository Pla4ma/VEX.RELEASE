import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { getMMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";

export interface UnlockExplainerState {
  /**
   * Feature keys the user has explicitly hidden.
   * Hidden features must be fully inert (no render, no route, no query, no subscribe, no notify).
   */
  hiddenFeatureKeys: string[];
}

export interface UnlockExplainerActions {
  /**
   * Hide a feature. Becomes inert immediately.
   */
  hideFeature: (featureKey: string) => void;

  /**
   * Reconsider a previously hidden feature.
   * Returns it to its natural unlock-explainer decision state.
   */
  reconsiderFeature: (featureKey: string) => void;

  /** Check if a feature is hidden by user */
  isHiddenByUser: (featureKey: string) => boolean;
}

export type UnlockExplainerStore = UnlockExplainerState &
  UnlockExplainerActions;

const initialState: UnlockExplainerState = {
  hiddenFeatureKeys: [],
};

const mmkvStorage = getMMKVStorageAdapter();

export const useUnlockExplainerStore = create<UnlockExplainerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      hideFeature: (featureKey: string) => {
        set((state) => ({
          hiddenFeatureKeys: state.hiddenFeatureKeys.includes(featureKey)
            ? state.hiddenFeatureKeys
            : [...state.hiddenFeatureKeys, featureKey],
        }));
      },

      reconsiderFeature: (featureKey: string) => {
        set((state) => ({
          hiddenFeatureKeys: state.hiddenFeatureKeys.filter(
            (k) => k !== featureKey,
          ),
        }));
      },

      isHiddenByUser: (featureKey: string): boolean => {
        return get().hiddenFeatureKeys.includes(featureKey);
      },
    }),
    {
      name: "unlock-explainer-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ hiddenFeatureKeys: state.hiddenFeatureKeys }),
    },
  ),
);
