import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { getMMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { captureSilentFailure } from "../../utils/silent-failure";

import {
  OnboardingStateSchema,
  type OnboardingState,
  type FocusDuration,
  type FocusGoal,
} from "./schemas";
import {
  isCompletionValidForUser,
  mergeOnboardingCompletion,
  type OnboardingDraft,
} from "./store-helpers";

const initialState: OnboardingState = {
  isOnboarded: false,
  currentStep: 0,
  goal: null,
  focusDuration: null,
  displayName: null,
  startedAt: null,
  completedAt: null,
  completedForUserId: null,
};

interface OnboardingActions {
  startOnboarding: () => void;
  setGoal: (goal: FocusGoal) => void;
  setFocusDuration: (duration: FocusDuration) => void;
  setDisplayName: (name: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  canSkipCurrentStep: () => boolean;
  canCompleteForUser: (userId: string | null | undefined) => boolean;
  setCompletionFromBackend: (userId: string, completedAt: number) => void;
  getDraft: (userId: string) => OnboardingDraft | undefined;
  saveDraft: (userId: string, draft: OnboardingDraft) => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;

const mmkvStorage = getMMKVStorageAdapter();

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startOnboarding: () => {
        set({ ...initialState, startedAt: Date.now() });
      },

      setGoal: (goal) => {
        set({ goal });
        setTimeout(() => {
          get().nextStep();
        }, 300);
      },

      setFocusDuration: (focusDuration) => {
        set({ focusDuration });
        setTimeout(() => {
          get().nextStep();
        }, 300);
      },

      setDisplayName: (name) => {
        const trimmed = name.trim();
        if (trimmed.length >= 2) {
          set({ displayName: trimmed });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 4) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      skipOnboarding: () => {
        set({
          ...mergeOnboardingCompletion(true, Date.now()),
        });
      },

      completeOnboarding: () => {
        set({
          ...mergeOnboardingCompletion(true, Date.now()),
        });
      },

      resetOnboarding: () => {
        set(initialState);
      },

      canSkipCurrentStep: () => {
        const { currentStep } = get();
        return currentStep >= 1;
      },

      canCompleteForUser: (userId) => {
        const state = get();
        return isCompletionValidForUser(state, userId);
      },

      setCompletionFromBackend: (userId, completedAt) => {
        set({
          completedAt,
          completedForUserId: userId,
          isOnboarded: true,
        });
      },

      getDraft: (_userId: string) => {
        const state = get();
        return {
          goal: state.goal ?? undefined,
          focusDuration: state.focusDuration ?? undefined,
          displayName: state.displayName ?? undefined,
          starterPresetId: undefined,
          element: undefined,
          personaId: undefined,
          squadId: null,
        };
      },

      saveDraft: (_userId: string, draft) => {
        if (draft.goal) {
          get().setGoal(draft.goal);
        }
        if (draft.focusDuration) {
          get().setFocusDuration(draft.focusDuration);
        }
        if (draft.displayName) {
          get().setDisplayName(draft.displayName);
        }
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => ({
        getItem: async (name: string): Promise<string | null> =>
          mmkvStorage.getItem(name),
        setItem: async (name: string, value: string): Promise<void> =>
          mmkvStorage.setItem(name, value),
        removeItem: async (name: string): Promise<void> =>
          mmkvStorage.removeItem(name),
      })),
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        currentStep: state.currentStep,
        goal: state.goal,
        focusDuration: state.focusDuration,
        displayName: state.displayName,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        completedForUserId: state.completedForUserId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            OnboardingStateSchema.parse(state);
          } catch (error) {
            captureSilentFailure(error, {
              feature: "onboarding",
              operation: "safe-fallback",
              type: "data",
            });
          }
        }
      },
    },
  ),
);
